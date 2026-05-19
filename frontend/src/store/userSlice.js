import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  currentMode: 'user', // 'user' or 'admin'
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
      state.isAuthenticated = true;
      state.currentMode = action.payload.role === 'admin' ? 'admin' : 'user';
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
    }
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setMode, updateWishlist, updateProfile } = userSlice.actions;
export default userSlice.reducer;
