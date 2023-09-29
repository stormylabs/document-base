import { create } from 'zustand';
import { CreateBotSlice, createBotSlice } from './slices/createBotSlice';

type StoreState = CreateBotSlice;

export const useAppStore = create<StoreState>()((...a) => ({
  ...createBotSlice(...a),
}));
