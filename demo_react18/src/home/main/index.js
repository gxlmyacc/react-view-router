import { RouterView } from 'react-view-router';

export default function Main() {
  return (
    <div className="App">
      <h2>MAIN</h2>
      <RouterView />
      <RouterView name="footer" />
    </div>
  );
}
