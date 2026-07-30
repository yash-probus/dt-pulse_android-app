import { useContext } from 'react';
import AppContextModule from '../context/AppContext';
import colors from '../constants/colors';

// Re-export useApp for convenience
export { useApp } from '../context/AppContext';

export function useColors() {
  // Dynamically import to avoid circular deps — we read from AppContext if available
  try {
    const { useApp } = require('../context/AppContext');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const app = useApp();
    return app.theme === 'dark' ? colors.dark : colors.light;
  } catch {
    return colors.light;
  }
}

export default useColors;
