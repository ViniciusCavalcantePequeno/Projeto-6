import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  token: "",
}

export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {

    definirToken: (state, action) => {
      state.token = action.payload          
    },    
  },
})

// Action creators are generated for each case reducer function
export const { definirToken } = loginSlice.actions

export default loginSlice.reducer