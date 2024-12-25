import { createSlice } from "@reduxjs/toolkit";

const currTheme = localStorage.getItem("theme") as "light" | "dark";

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: currTheme || "light" },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.mode);
    },
    setTheme(state, action) {
      state.mode = action.payload;
      localStorage.setItem("theme", state.mode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice;
