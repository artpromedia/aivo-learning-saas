import { APIRequestContext, request } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';
const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

export interface ApiResponse<T = unknown> {
  status: number;
  ok: boolean;
  data: T;
  headers: Record<string, string>;
}

export class ApiClient {
  private token: string | null = null;
  private ctx: APIRequestContext | null = null;
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string): void {
    this.token = token;
    this.ctx = null;
  }

  clearToken(): void {
    this.token = null;
    this.ctx = null;
  }

  private async getContext(): Promise<APIRequestContext> {
    if (!this.ctx) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-test-run': 'true',
      };
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
      this.ctx = await request.newContext({
        baseURL: this.baseUrl,
        extraHTTPHeaders: headers,
      });
    }
    return this.ctx;
  }

  private async doRequest<T>(method: string, path: string, data?: unknown): Promise<ApiResponse<T>> {
    const ctx = await this.getContext();
    const options = data ? { data } : undefined;

    let res;
    switch (method) {
      case 'GET':
        res = await ctx.get(path, options);
        break;
      case 'POST':
        res = await ctx.post(path, options);
        break;
      case 'PUT':
        res = await ctx.put(path, options);
        break;
      case 'PATCH':
        res = await ctx.patch(path, options);
        break;
      case 'DELETE':
        res = await ctx.delete(path, options);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    let responseData: T;
    try {
      responseData = await res.json();
    } catch {
      responseData = (await res.text()) as unknown as T;
    }

    const headersObj: Record<string, string> = {};
    const allHeaders = res.headersArray();
    for (const { name, value } of allHeaders) {
      headersObj[name.toLowerCase()] = value;
    }

    return {
      status: res.status(),
      ok: res.ok(),
      data: responseData,
      headers: headersObj,
    };
  }

  async get<T = unknown>(path: string): Promise<ApiResponse<T>> {
    return this.doRequest<T>('GET', path);
  }

  async post<T = unknown>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.doRequest<T>('POST', path, data);
  }

  async put<T = unknown>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.doRequest<T>('PUT', path, data);
  }

  async patch<T = unknown>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.doRequest<T>('PATCH', path, data);
  }

  async del<T = unknown>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.doRequest<T>('DELETE', path, data);
  }

  async dispose(): Promise<void> {
    if (this.ctx) {
      await this.ctx.dispose();
      this.ctx = null;
    }
  }

  // Auth endpoints
  async signUp(email: string, password: string, name: string, role: string = 'parent') {
    return this.post('/auth/sign-up', { email, password, name, role });
  }

  async signIn(email: string, password: string) {
    return this.post<{ token: string; user: { id: string }; session?: { token: string } }>('/auth/sign-in', { email, password });
  }

  async signOut() {
    return this.post('/auth/sign-out');
  }

  async getSession() {
    return this.get<{ user?: { id: string }; session?: unknown }>('/auth/session');
  }

  async verifyEmail(email: string) {
    return this.post('/test/verify-email', { email });
  }

  async requestPasswordReset(email: string) {
    return this.post('/auth/password-reset', { email });
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    return this.post('/auth/password-reset/confirm', { token, newPassword });
  }

  async getLastResetToken(email: string) {
    return this.get<{ token: string }>(`/test/last-reset-token?email=${encodeURIComponent(email)}`);
  }

  // Family / Learner endpoints
  async getLearners() {
    return this.get('/family/learners');
  }

  async createLearner(data: { name: string; dateOfBirth: string; gradeLevel: string; functioningLevel: number; specialNeeds?: string[] }) {
    return this.post('/family/learners', data);
  }

  async getLearner(learnerId: string) {
    return this.get(`/family/learners/${learnerId}`);
  }

  async updateLearner(learnerId: string, data: Record<string, unknown>) {
    return this.put(`/family/learners/${learnerId}`, data);
  }

  async submitAssessment(learnerId: string, data: { responses: unknown[]; functioningLevel?: number; testMode?: boolean }) {
    return this.post(`/family/learners/${learnerId}/assessment`, data);
  }

  async uploadIep(learnerId: string, data: { content: string; testMode?: boolean }) {
    return this.post(`/family/learners/${learnerId}/iep`, data);
  }

  // Brain endpoints
  async createBrainProfile(learnerId: string) {
    const brainClient = new ApiClient(BRAIN_API);
    if (this.token) brainClient.setToken(this.token);
    const res = await brainClient.post<{ brainId?: string; id?: string }>('/brain/profiles', { learnerId });
    await brainClient.dispose();
    return res;
  }

  async getBrainProfile(brainId: string) {
    const brainClient = new ApiClient(BRAIN_API);
    if (this.token) brainClient.setToken(this.token);
    const res = await brainClient.get(`/brain/profiles/${brainId}`);
    await brainClient.dispose();
    return res;
  }

  async approveBrainProfile(brainId: string) {
    const brainClient = new ApiClient(BRAIN_API);
    if (this.token) brainClient.setToken(this.token);
    const res = await brainClient.post(`/brain/profiles/${brainId}/approve`);
    await brainClient.dispose();
    return res;
  }

  async getBrainContext(brainId: string) {
    const brainClient = new ApiClient(BRAIN_API);
    if (this.token) brainClient.setToken(this.token);
    const res = await brainClient.get(`/brain/profiles/${brainId}/context`);
    await brainClient.dispose();
    return res;
  }

  async createBrainSnapshot(brainId: string) {
    const brainClient = new ApiClient(BRAIN_API);
    if (this.token) brainClient.setToken(this.token);
    const res = await brainClient.post(`/brain/profiles/${brainId}/snapshots`);
    await brainClient.dispose();
    return res;
  }

  async rollbackBrain(brainId: string, snapshotId: string) {
    const brainClient = new ApiClient(BRAIN_API);
    if (this.token) brainClient.setToken(this.token);
    const res = await brainClient.post(`/brain/profiles/${brainId}/rollback`, { snapshotId });
    await brainClient.dispose();
    return res;
  }

  async getBrainSnapshots(brainId: string) {
    const brainClient = new ApiClient(BRAIN_API);
    if (this.token) brainClient.setToken(this.token);
    const res = await brainClient.get(`/brain/profiles/${brainId}/snapshots`);
    await brainClient.dispose();
    return res;
  }

  // Billing endpoints
  async createSubscription(planTier: string = 'growth') {
    return this.post('/billing/subscriptions', { planTier, paymentMethod: 'test_pm_card_visa', testMode: true });
  }

  async getSubscriptions() {
    return this.get('/billing/subscriptions');
  }

  async addTutorAddon(learnerId: string, subject: string) {
    return this.post('/billing/tutor-add-ons', { learnerId, subject, testMode: true });
  }

  async removeTutorAddon(addonId: string) {
    return this.del(`/billing/tutor-add-ons/${addonId}`);
  }

  // Tutor endpoints
  async createTutorSession(learnerId: string, subject: string) {
    return this.post<{ sessionId?: string; id?: string }>('/tutor/sessions', { learnerId, subject });
  }

  async getTutorSession(sessionId: string) {
    return this.get(`/tutor/sessions/${sessionId}`);
  }

  async sendTutorMessage(sessionId: string, message: string) {
    return this.post(`/tutor/sessions/${sessionId}/messages`, { message });
  }

  async completeTutorSession(sessionId: string) {
    return this.post(`/tutor/sessions/${sessionId}/complete`);
  }

  // Homework endpoints
  async uploadHomework(data: { learnerId: string; subject: string; content: string; testMode?: boolean }) {
    return this.post('/learning/homework/upload', data);
  }

  async getHomework(homeworkId: string) {
    return this.get(`/learning/homework/${homeworkId}`);
  }

  async createHomeworkSession(homeworkId: string) {
    return this.post(`/learning/homework/${homeworkId}/session`);
  }

  // Engagement / Gamification endpoints
  async getXp(learnerId?: string) {
    const query = learnerId ? `?learnerId=${learnerId}` : '';
    return this.get(`/engagement/xp${query}`);
  }

  async getStreaks(learnerId?: string) {
    const query = learnerId ? `?learnerId=${learnerId}` : '';
    return this.get(`/engagement/streaks${query}`);
  }

  async getShop() {
    return this.get('/engagement/shop');
  }

  async purchaseShopItem(itemId: string, learnerId: string) {
    return this.post('/engagement/shop/purchase', { itemId, learnerId });
  }

  async createChallenge(data: { learnerId: string; type: string }) {
    return this.post('/engagement/challenges', data);
  }

  async joinChallenge(challengeId: string) {
    return this.post(`/engagement/challenges/${challengeId}/join`);
  }

  // Communication endpoints
  async getNotifications() {
    return this.get('/comms/notifications');
  }

  async respondToRecommendation(recommendationId: string, response: string, adjustmentText?: string) {
    return this.post(`/comms/recommendations/${recommendationId}/respond`, { response, adjustmentText });
  }

  async submitInsight(data: { learnerId: string; content: string; type: string }) {
    return this.post('/comms/insights', data);
  }

  async inviteCaregiver(email: string, learnerId: string, name: string) {
    return this.post('/comms/caregiver-invite', { email, learnerId, name });
  }

  // Admin endpoints
  async getAdminUsers() {
    return this.get('/admin/users');
  }

  async getAdminTenants() {
    return this.get('/admin/tenants');
  }
}

export function createApiClient(token?: string): ApiClient {
  const client = new ApiClient();
  if (token) {
    client.setToken(token);
  }
  return client;
}

export function createBrainApiClient(token?: string): ApiClient {
  const client = new ApiClient(BRAIN_API);
  if (token) {
    client.setToken(token);
  }
  return client;
}
