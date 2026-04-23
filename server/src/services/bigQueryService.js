const logger = require("../utils/logger");

/**
 * BigQuery Service (Stub)
 * In a production environment, this would use @google-cloud/bigquery
 * to stream event data for long-term analytics and auditing.
 */
class BigQueryService {
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT;
    this.datasetId = "election_analytics";
    this.tableId = "events";
    this.isConfigured = !!this.projectId;
  }

  /**
   * Log an event to BigQuery
   * @param {string} eventType - Type of event (e.g., 'CHAT_MESSAGE', 'ELIGIBILITY_CHECK')
   * @param {Object} data - Event payload
   */
  async logEvent(eventType, data = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      event_type: eventType,
      ...data,
    };

    if (!this.isConfigured) {
      logger.debug(`[BigQuery Stub] Event logged: ${eventType}`, event);
      return;
    }

    try {
      // Logic for streaming to BigQuery would go here
      // await bigquery.dataset(this.datasetId).table(this.tableId).insert([event]);
      logger.info(`[BigQuery] Event streamed: ${eventType}`);
    } catch (error) {
      logger.error("BigQuery streaming error:", error);
    }
  }

  /**
   * Log chat metadata for analysis
   */
  async logChatMetadata(userId, tokens, responseTime) {
    return this.logEvent("CHAT_METADATA", {
      user_id: userId,
      tokens_used: tokens,
      response_time_ms: responseTime,
    });
  }
}

module.exports = new BigQueryService();
