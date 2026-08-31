export interface Feature {
  id: string;
  name: string;
  description: string;
  viewed: boolean;
  releaseDate: string;
}

export const getFeatureFlags = async (): Promise<Feature[]> => {
  /*
   * TODO: Implement actual feature flags logic
   * This is a mock implementation
   */
  return [
    {
      id: 'feature-1',
      name: 'Tema escuro',
      description: 'Ative o tema escuro para trabalhar com pouca luz',
      viewed: true,
      releaseDate: '2024-03-15',
    },
    {
      id: 'feature-2',
      name: 'Organização das abas',
      description: 'Escolha quais abas aparecem e em que ordem',
      viewed: false,
      releaseDate: '2024-03-20',
    },
  ];
};

export const markFeatureViewed = async (featureId: string): Promise<void> => {
  /* TODO: Implement actual feature viewed logic */
  console.log(`Marking feature ${featureId} as viewed`);
};
