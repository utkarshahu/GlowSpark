import { createSlice } from '@reduxjs/toolkit';

const savedNotifications = (() => {
  try {
    return JSON.parse(localStorage.getItem('admin_notifications') || '[]');
  } catch (e) {
    return [];
  }
})();

const savedUnreadCount = (() => {
  try {
    return Number(localStorage.getItem('admin_unread_count') || '0');
  } catch (e) {
    return 0;
  }
})();

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  currentMode: 'user', // 'user' or 'admin'
  unreadOrdersCount: savedUnreadCount,
  notifications: savedNotifications,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.currentUser = action.payload;
      state.currentMode = action.payload.role === 'admin' ? 'admin' : 'user';
      state.isAuthenticated = true;
    },
    loginFailure: (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.currentMode = 'user';
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.currentMode = 'user';
      state.unreadOrdersCount = 0;
      state.notifications = [];
      try {
        localStorage.removeItem('admin_notifications');
        localStorage.removeItem('admin_unread_count');
      } catch (e) {
        console.error(e);
      }
    },
    setMode: (state, action) => {
      state.currentMode = action.payload;
    },
    updateWishlist: (state, action) => {
      if (state.currentUser) {
        state.currentUser.wishlist = action.payload;
      }
    },
    updateProfile: (state, action) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (state.notifications.length > 20) {
        state.notifications.pop();
      }
      state.unreadOrdersCount += 1;
      try {
        localStorage.setItem('admin_notifications', JSON.stringify(state.notifications));
        localStorage.setItem('admin_unread_count', state.unreadOrdersCount.toString());
      } catch (e) {
        console.error(e);
      }
    },
    clearUnreadOrders: (state) => {
      state.unreadOrdersCount = 0;
      try {
        localStorage.setItem('admin_unread_count', '0');
      } catch (e) {
        console.error(e);
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadOrdersCount = 0;
      try {
        localStorage.removeItem('admin_notifications');
        localStorage.removeItem('admin_unread_count');
      } catch (e) {
        console.error(e);
      }
    }
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  setMode, 
  updateWishlist, 
  updateProfile, 
  addNotification, 
  clearUnreadOrders, 
  clearNotifications 
} = userSlice.actions;

export default userSlice.reducer;
