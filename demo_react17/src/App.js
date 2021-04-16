import './styles.css';
import { RouterView } from 'react-view-router';
import router from './router';

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some madgic happen!</h2>
      <RouterView router={router} />
    </div>
  );
}
