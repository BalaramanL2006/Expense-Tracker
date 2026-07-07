// Simulated API service layer. Easily replaceable with Axios/Fetch calls.
const SIMULATED_DELAY = 400;

const delay = (ms = SIMULATED_DELAY) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  auth: {
    login: async (email, password) => {
      await delay();
      // Logic handles locally via AuthContext db lookup, returning profile tokens
      return { token: 'mock-jwt-token-xyz', user: { email, name: 'Admin User' } };
    },
    register: async (userData) => {
      await delay();
      return { success: true, user: userData };
    },
    getProfile: async () => {
      await delay();
      return { success: true, user: { name: 'Demo Admin', email: 'demo@example.com' } };
    },
    updateProfile: async (fields) => {
      await delay();
      return { success: true, data: fields };
    }
  },
  transactions: {
    getAll: async () => {
      await delay();
      const localData = localStorage.getItem('expense_app_transactions');
      return localData ? JSON.parse(localData) : [];
    },
    create: async (txnData) => {
      await delay();
      return { success: true, data: txnData };
    },
    update: async (id, updatedFields) => {
      await delay();
      return { success: true, id, data: updatedFields };
    },
    delete: async (id) => {
      await delay();
      return { success: true, id };
    }
  },
  budgets: {
    getAll: async () => {
      await delay();
      const localData = localStorage.getItem('expense_app_budgets');
      return localData ? JSON.parse(localData) : [];
    },
    create: async (budgetData) => {
      await delay();
      return { success: true, data: budgetData };
    },
    update: async (id, fields) => {
      await delay();
      return { success: true, id, data: fields };
    },
    delete: async (id) => {
      await delay();
      return { success: true, id };
    }
  },
  goals: {
    getAll: async () => {
      await delay();
      const localData = localStorage.getItem('expense_app_goals');
      return localData ? JSON.parse(localData) : [];
    },
    create: async (goalData) => {
      await delay();
      return { success: true, data: goalData };
    },
    update: async (id, fields) => {
      await delay();
      return { success: true, id, data: fields };
    },
    delete: async (id) => {
      await delay();
      return { success: true, id };
    }
  }
};
export default api;
