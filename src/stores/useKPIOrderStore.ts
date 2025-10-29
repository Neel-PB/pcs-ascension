import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface KPIOrderState {
  fte: string[];
  volume: string[];
  productivity: string[];
  sectionOrder: string[];
  setOrder: (section: 'fte' | 'volume' | 'productivity', order: string[]) => void;
  getOrder: (section: 'fte' | 'volume' | 'productivity') => string[];
  setSectionOrder: (order: string[]) => void;
}

const defaultOrder = {
  fte: ['vacancy-rate', 'hired-ftes', 'target-ftes', 'fte-variance', 'open-reqs', 'req-variance'],
  volume: ['12m-monthly', '12m-daily', '3m-low', '3m-high', 'target-vol', 'override-vol'],
  productivity: ['paid-ftes', 'total-fullpart-ftes', 'contract-ftes', 'overtime-ftes', 'total-prn', 'total-np'],
};

export const useKPIOrderStore = create<KPIOrderState>()(
  persist(
    (set, get) => ({
      fte: defaultOrder.fte,
      volume: defaultOrder.volume,
      productivity: defaultOrder.productivity,
      sectionOrder: ['fte', 'volume', 'productivity'],
      setOrder: (section, order) => set({ [section]: order }),
      getOrder: (section) => get()[section],
      setSectionOrder: (order) => set({ sectionOrder: order }),
    }),
    {
      name: 'kpi-order-storage',
    }
  )
);
