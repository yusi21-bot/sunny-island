import {createRoot} from 'react-dom/client';
import App from './FamilyIslandApp';
import './globals.css';
import './polish.css';
createRoot(document.getElementById('root')!).render(<App/>);

// A pasted invitation may only change the hash in an already-open tab.
window.addEventListener("hashchange", () => window.location.reload());
