"""OpenTelemetry + Prometheus + Sentry + Langfuse observability for ai-svc."""

import os
import time

from fastapi import FastAPI, Request, Response
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.sampling import TraceIdRatioBased
from prometheus_client import (
    Counter,
    Histogram,
    Gauge,
    generate_latest,
    CONTENT_TYPE_LATEST,
    CollectorRegistry,
)
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.asyncpg import AsyncPGIntegration


SERVICE_NAME = "ai-svc"

registry = CollectorRegistry()

http_requests_total = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "route", "status_code"],
    registry=registry,
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "route"],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registry=registry,
)

llm_request_duration_seconds = Histogram(
    "llm_request_duration_seconds",
    "LLM request duration in seconds",
    ["provider", "model"],
    buckets=[0.1, 0.25, 0.5, 1, 2, 4, 8, 15, 30],
    registry=registry,
)

llm_tokens_used_total = Counter(
    "llm_tokens_used_total",
    "Total LLM tokens used",
    ["provider", "model", "type"],
    registry=registry,
)

llm_content_generation_seconds = Histogram(
    "llm_content_generation_seconds",
    "Content generation duration in seconds",
    ["session_type"],
    buckets=[0.5, 1, 2, 4, 8, 15, 30],
    registry=registry,
)

quality_gate_results_total = Counter(
    "quality_gate_results_total",
    "Quality gate pass/fail results",
    ["result"],
    registry=registry,
)

llm_estimated_cost_dollars = Counter(
    "llm_estimated_cost_dollars_total",
    "Estimated LLM cost in dollars",
    ["provider", "model"],
    registry=registry,
)


def init_tracing() -> None:
    """Initialize OpenTelemetry tracing with OTLP exporter."""
    environment = os.getenv("NODE_ENV", "development")
    sample_rate = float(os.getenv("OTEL_TRACES_SAMPLE_RATE", "1.0" if environment != "production" else "0.1"))
    otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318")

    resource = Resource.create(
        {
            "service.name": SERVICE_NAME,
            "service.version": os.getenv("SERVICE_VERSION", "0.1.0"),
            "deployment.environment": environment,
        }
    )

    sampler = TraceIdRatioBased(sample_rate)
    provider = TracerProvider(resource=resource, sampler=sampler)

    exporter = OTLPSpanExporter(endpoint=f"{otlp_endpoint}/v1/traces")
    provider.add_span_processor(BatchSpanProcessor(exporter))

    trace.set_tracer_provider(provider)


def init_sentry() -> None:
    """Initialize Sentry error tracking."""
    dsn = os.getenv("SENTRY_DSN", "")
    if not dsn:
        return

    environment = os.getenv("NODE_ENV", "development")

    def before_send(event, hint):
        if "user" in event:
            event["user"].pop("email", None)
            event["user"].pop("username", None)
            event["user"].pop("ip_address", None)
        return event

    sentry_sdk.init(
        dsn=dsn,
        environment=environment,
        traces_sample_rate=0.1,
        before_send=before_send,
        integrations=[
            FastApiIntegration(transaction_style="endpoint"),
            AsyncPGIntegration(),
        ],
    )


def create_langfuse_handler():
    """Create a Langfuse callback handler for LiteLLM integration.

    Returns None if Langfuse is not configured.
    """
    public_key = os.getenv("LANGFUSE_PUBLIC_KEY", "")
    secret_key = os.getenv("LANGFUSE_SECRET_KEY", "")
    host = os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")

    if not public_key or not secret_key:
        return None

    try:
        from langfuse import Langfuse

        langfuse = Langfuse(
            public_key=public_key,
            secret_key=secret_key,
            host=host,
        )
        return langfuse
    except ImportError:
        return None


def track_llm_usage(
    provider: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    duration_seconds: float,
    session_type: str = "content",
    learner_id: str | None = None,
) -> None:
    """Track LLM usage metrics for Prometheus and cost estimation."""
    llm_tokens_used_total.labels(provider=provider, model=model, type="input").inc(input_tokens)
    llm_tokens_used_total.labels(provider=provider, model=model, type="output").inc(output_tokens)
    llm_request_duration_seconds.labels(provider=provider, model=model).observe(duration_seconds)
    llm_content_generation_seconds.labels(session_type=session_type).observe(duration_seconds)

    cost = estimate_cost(provider, model, input_tokens, output_tokens)
    if cost > 0:
        llm_estimated_cost_dollars.labels(provider=provider, model=model).inc(cost)


# Per-token pricing (approximate, in dollars)
TOKEN_PRICING = {
    "anthropic": {
        "claude-sonnet-4-20250514": {"input": 3.0 / 1_000_000, "output": 15.0 / 1_000_000},
        "claude-haiku-4-5-20251001": {"input": 0.80 / 1_000_000, "output": 4.0 / 1_000_000},
    },
    "openai": {
        "gpt-4o": {"input": 2.5 / 1_000_000, "output": 10.0 / 1_000_000},
        "gpt-4o-mini": {"input": 0.15 / 1_000_000, "output": 0.60 / 1_000_000},
    },
}


def estimate_cost(provider: str, model: str, input_tokens: int, output_tokens: int) -> float:
    """Estimate cost based on token usage and provider pricing."""
    provider_pricing = TOKEN_PRICING.get(provider, {})
    model_pricing = provider_pricing.get(model)
    if not model_pricing:
        return 0.0
    return (input_tokens * model_pricing["input"]) + (output_tokens * model_pricing["output"])


def setup_observability(app: FastAPI) -> None:
    """Wire all observability into a FastAPI application."""
    init_tracing()
    init_sentry()

    FastAPIInstrumentor.instrument_app(app)

    @app.middleware("http")
    async def metrics_middleware(request: Request, call_next):
        route = request.url.path
        method = request.method
        start = time.perf_counter()
        response: Response = await call_next(request)
        duration = time.perf_counter() - start

        http_requests_total.labels(
            method=method,
            route=route,
            status_code=str(response.status_code),
        ).inc()

        http_request_duration_seconds.labels(
            method=method,
            route=route,
        ).observe(duration)

        return response

    @app.get("/metrics")
    async def metrics_endpoint():
        data = generate_latest(registry)
        return Response(content=data, media_type=CONTENT_TYPE_LATEST)
