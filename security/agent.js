// agent.js;

class Agent {
  #data;
  #isAuthenticated;
  #role;
  #lastActivity;

  constructor(data, isAuthenticated, role, lastActivity) {
    this.#data = data;
    this.#isAuthenticated = isAuthenticated;
    this.#role = role;
    this.#lastActivity = lastActivity;
  }

  getData() {
    return this.#data;
  }

  // setData(data) {
  //   this.#data = data;
  // }

  getIsAuthenticated() {
    return this.#isAuthenticated;
  }

  // setIsAuthenticated(isAuthenticated) {
  //   this.#isAuthenticated = isAuthenticated;
  // }

  getRole() {
    return this.#role;
  }

  getLastActivity() {
    return this.#lastActivity;
  }

  // setRole(role) {
  //   this.#role = role;
  // }

  static createAgent(req, isAuthenticated, role, lastActivity) {
    const data = {
      userId: req.session.userId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    };

    return new Agent(data, isAuthenticated, role, lastActivity);
  }

  toJSON() {
    return {
      data: this.#data,
      isAuthenticated: this.#isAuthenticated,
      role: this.#role,
      lastActivity: this.#lastActivity,
    };
  }

  static fromJSON(json) {
    return new Agent(
      json.data,
      json.isAuthenticated,
      json.role,
      json.lastActivity
    );
  }
}

export default Agent;
