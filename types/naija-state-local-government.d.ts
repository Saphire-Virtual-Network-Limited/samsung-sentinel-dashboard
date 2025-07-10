// types/naija-state-local-government.d.ts
declare module "naija-state-local-government" {
  export interface StateData {
    state: string;
    alias: string;
    lgas: string[];
  }

  export interface NaijaStates {
    all(): StateData[];
    states(): string[];
    lgas(state: string): string[];
  }

  const NaijaStates: NaijaStates;
  export default NaijaStates;
}
