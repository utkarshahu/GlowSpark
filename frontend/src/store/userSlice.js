import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
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
    },
    loginFailure: (state) => {
      state.loading = false;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
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

export const { loginStart, loginSuccess, loginFailure, logout, updateWishlist, updateProfile } = userSlice.actions;
export default userSlice.reducer;
