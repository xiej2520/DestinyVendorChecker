import './App.css'
import AppBar from './components/AppBar.tsx';

import ItemDisplay from './components/ItemDisplay';
import { StoreContextProvider } from './store/index.tsx';

function App() {
  return (
    <StoreContextProvider>
      <AppBar></AppBar>
      <h1 className="text-5xl font-bold my-4">Destiny Vendor Checker</h1>
      <ItemDisplay></ItemDisplay>
    </StoreContextProvider>
  )
}

export default App;
