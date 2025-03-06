// Empêcher le serveur de démarrer pendant les tests
jest.mock("./server", () => {
  const originalModule = jest.requireActual("./server");

  // Ne pas démarrer le serveur, mais exporter le pool
  return {
    ...originalModule,
    listen: jest.fn(),
  };
});

// Désactiver les logs console pendant les tests pour réduire le bruit
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
