"""OpenTelemetry + Prometheus + Sentry observability for brain-svc."""

import os
import time
from contextlib import asynccontextmanager

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


SERVICE_NAME = "brain-svc"

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

brain_clone_duration_seconds = Histogram(
    "brain_clone_duration_seconds",
    "Brain clone operation duration in seconds",
    buckets=[0.1, 0.5, 1, 2, 5, 10, 30, 60],
    registry=registry,
)

mastery_update_duration_seconds = Histogram(
    "mastery_update_duration_seconds",
    "Mastery update operation duration in seconds",
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
    registry=registry,
)

active_brains_gauge = Gauge(
    "active_brains_total",
    "Number of active brain profiles",
    registry=registry,
)

recommendation_generation_total = Counter(
    "recommendation_generation_total",
    "Total recommendation generations",
    ["type"],
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
