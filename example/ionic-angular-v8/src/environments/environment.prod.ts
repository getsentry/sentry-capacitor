// Import local configuration (gitignored - edit environment.local.ts to set your values)
import { localConfig } from './environment.local';

export const environment = {
  production: true,
  spotlightSidecarUrl: localConfig.spotlightSidecarUrl
};
