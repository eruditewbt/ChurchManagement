// agent - controller.js;
import { AgentService } from "./agent-service.js";

class AgentController {
  async trackUserActivity(req, res, next) {
    try {
      const agentService = new AgentService();
      await agentService.trackUserActivity(req);
      next();
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
}

export default AgentController;
