export interface LLMClient {
  /**
   * Send a prompt and return the model's text response.
   */
  complete(prompt: string): Promise<string>;
}
