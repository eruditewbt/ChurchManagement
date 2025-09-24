// agent - service.js;

import Agent from "./agent.js";
import axios from "axios";
import { v4 } from "uuid";
import UserAgent from "../model/UserAgent.js";

function redirector(url, method) {
  // const url = req.url;
  const reqGet = method == "GET";
  const isUrl = url === "/" || url === "/login" || url === "/register";
  if (isUrl && reqGet) {
    return true;
  } else {
    return false;
  }
}

function middleCorrect(middleware, req) {
  const userId = req.session.userId || "id";
  const url = req.url;
  const isUrl = url === "/" || url === "/login" || url === "/register";
  const skipAuthorize =
    url === "/" ||
    url === "/login" ||
    url === "/register" ||
    url === "/memberIndex" ||
    url === `/update-user/${userId}`;
  const reqGet = req.method == "GET";
  const skipLogin = url === "/login";
  console.log(url, isUrl, reqGet, userId, skipAuthorize);
  switch (middleware) {
    case "authenticate":
      if (isUrl && reqGet) {
        return true;
      }
    case "validate":
      if (isUrl) {
        return true;
      }
    case "authorize":
      if (skipAuthorize) {
        return true;
      }
    case "track":
      if (skipLogin && reqGet) {
        return true;
      }
    default:
      console.log("No match found, middleware will execute process");
      return false;
  }
}

function getAgent(req) {
  const userAgentRecord = req.query.agent;
  if (userAgentRecord) {
    try {
      const agentData = JSON.parse(decodeURIComponent(userAgentRecord));
      const userAgent = Agent.fromJSON(agentData);
      req.session.agent = userAgent;
      return userAgent;
    } catch (error) {
      console.error("Error parsing agent data:", error);
      req.flash("error_msg", "Error parsing agent data:" + error);
      return null;
    }
  } else {
    return null;
  }
}

function getAgentData(data, isAuthenticated, role, lastActivity) {
  try {
    const agent = new Agent(data, isAuthenticated, role, lastActivity);
    const agentData = agent.toJSON();
    const agentJson = JSON.stringify(agentData);
    const encodedAgentJson = encodeURIComponent(agentJson);
    return encodedAgentJson;
  } catch (error) {
    console.error("Error parsing agent data:", error);
    req.flash("error_msg", "Error parsing agent data:" + error);
    return null;
  }
}

class AgentService {
  allowedID;

  constructor() {
    this.allowedID = [];
  }

  async sendAgent(agent) {
    const serializedAgent = JSON.stringify(agent);
    try {
      const response = await axios.post("http://example.com/agents", {
        agent: serializedAgent,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  authenticate(req, role, lastActivity) {
    // const role = agent.getRole();
    return Agent.createAgent(req, true, role, lastActivity);
  }

  authorize(req, agent, role) {
    const lastActivity = agent.getLastActivity();
    return Agent.createAgent(req, true, role);
  }

  static getAgent(req) {
    const userAgentRecord = req.query.agent;
    if (userAgentRecord) {
      try {
        const agentData = JSON.parse(decodeURIComponent(userAgentRecord));
        const userAgent = Agent.fromJSON(agentData);
        req.session.agent = userAgent;
        return userAgent;
      } catch (error) {
        console.error("Error parsing agent data:", error);
        req.flash("error_msg", "Error parsing agent data:" + error);
        return null;
      }
    } else {
      return null;
    }
  }

  static getAgentData(data, isAuthenticated, role, lastActivity) {
    try {
      const agent = new Agent(data, isAuthenticated, role, lastActivity);
      const agentData = agent.toJSON();
      const agentJson = JSON.stringify(agentData);
      const encodedAgentJson = encodeURIComponent(agentJson);
      return encodedAgentJson;
    } catch (error) {
      console.error("Error parsing agent data:", error);
      req.flash("error_msg", "Error parsing agent data:" + error);
      return null;
    }
  }

  isAuthenticated(req, res, next) {
    try {
      const nt = middleCorrect("authenticate", req);
      if (nt) {
        return next();
      }
      const agent = getAgent(req);

      if (!agent) {
        req.flash("error_msg", "Unauthorized: No user session found.");
        return res.redirect(req.get("referer") || "/");
      }

      const agentData = agent.getData();
      const agentStatus = agent.getIsAuthenticated();

      if (!agentData || !agentStatus) {
        req.flash("error_msg", "Unauthorized: No user session found.");
        return res.redirect(req.get("referer") || "/");
      }
      return next();
    } catch (error) {
      console.error(error);
      req.flash("error_msg", "Internal Server Error" + error);
      return res.redirect(req.get("referer") || "/");
    }
  }

  isAuthorized(roles) {
    return (req, res, next) => {
      const nt = middleCorrect("authorize", req);
      if (nt) {
        return next();
      }
      try {
        const agent = getAgent(req);
        const agentData = agent.getData();
        const agentRole = agent.getRole();
        if (agentData && agentRole) {
          console.log(agentRole, roles);
          if (roles.includes(agentRole)) {
            return next();
          } else {
            req.flash(
              "error_msg",
              "You do not have permission to view this resource."
            );
            console.log("invalid role");
            req.flash("error_msg", "invalid role");
            return res.redirect("/access-denied");
          }
        } else {
          console.log("invaliduser agent");
          req.flash("error_msg", "no session found");
          res.redirect("/access-denied");
        }
      } catch (error) {
        console.error(error);
        req.flash("error_msg", `internal server error`);
        const nt = redirector(req.url, req.method);
        if (nt) {
          return next();
        } else {
          return res.redirect(req.get("referer") || "/login");
        }
      }
    };
  }

  trackUserActivity(req, res, next) {
    try {
      //track if user is authenticated
      const userId = req.session.userId || false;

      //if user is not authenticated
      if (!userId) {
        const userAgentRecord = getAgent(req);
        if (userAgentRecord) {
          const agentData = userAgentRecord.getData();
          req.flash("agent", userAgentRecord);
          req.session.userId = agentData.userId;
          req.session.agent = userAgentRecord;
          return next();
        } else {
          // create a new userAgent
          const id = v4();
          const data = {
            userId: id,
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
          };
          const agent = getAgentData(data, false, null, null);
          req.flash("agent", agent);
          req.session.agent = agent;
          req.session.userId = id;
          req.session.role = null;
          req.session.lastActivity = null;
          // return next(); // No user, skip tracking
          const nt = redirector(req.url, req.method);
          if (nt) {
            return next();
          } else {
            return res.redirect(req.get("referer") || "/login");
          }
        }
      } else if (userId) {
        const userAgentRecord = getAgent(req);
        if (userAgentRecord) {
          req.flash("agent", userAgentRecord);
          return next();
        } else {
          // create a new userAgent
          // create a new userAgent
          const id = userId;
          const data = {
            userId: id,
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
          };
          const agent = getAgentData(data, false, null, null);
          req.flash("agent", agent);
          req.session.agent = agent;
          req.session.userId = id;
          req.session.role = null;
          req.session.lastActivity = null;
          req.flash(
            "error_msg",
            `Unauthorized Please log in properly to view this resource. tried 1 of 10`
          );
          const nt = redirector(req.url, req.method);
          if (nt) {
            return next();
          } else {
            return res.redirect(req.get("referer") || "/login");
          }
        }
      }
    } catch (error) {
      console.error(error);
      req.flash("error_msg", `internal server error`);
      const nt = redirector(req.url, req.method);
      if (nt) {
        return next();
      } else {
        return res.redirect(req.get("referer") || "/login");
      }
    }
  }

  async validateAgent(req, res, next) {
    const nt = middleCorrect("validate", req, next);
    if (nt) {
      return next();
    }
    const agent = getAgent(req);
    if (!agent) {
      return next();
    }
    const agentData = agent.getData();
    const agentRole = agent.getRole();
    const agentlastActivity = agent.getLastActivity();
    const userId = agentData.userId;
    if (secure.allowedID.includes(userId)) {
      return next();
    }
    const userAgentRecord = await UserAgent.findOne({
      where: { USERID: userId },
    });
    if (!userAgentRecord) {
      req.flash(
        "error_msg",
        `Unauthorized Please log in properly no record found. tried 1 of 10`
      );
      const nt = redirector(req.url, req.method);
      if (nt) {
        return next();
      } else {
        return res.redirect(req.get("referer") || "/login");
      }
    }
    const data = {
      userId: userId,
      ipAddress: userAgentRecord.IPADDRESS,
      userAgent: userAgentRecord.USERAGENT,
    };
    console.log(
      userAgentRecord.ROLE,
      agentRole,
      userAgentRecord.LASTACTIVITY,
      agentlastActivity,
      data,
      agentData
    );
    if (
      userAgentRecord.ROLE !== agentRole ||
      userAgentRecord.LASTACTIVITY !== agentlastActivity ||
      data !== agentData
    ) {
      req.flash(
        "error_msg",
        `Unauthorized Please log in properly to view this resource. tried 1 of 10`
      );
      const nt = redirector(req.url, req.method);
      if (nt) {
        return next();
      } else {
        return res.redirect(req.get("referer") || "/login");
      }
    }
    return next();
  }
}

const secure = new AgentService();

export { secure, AgentService };
