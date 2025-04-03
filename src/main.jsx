import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import {Provider} from 'react-redux'
import AppStore from './utils/Store.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
     <Provider store={AppStore}>
     <BrowserRouter>
    <App />
    </BrowserRouter>
    </Provider>
  </StrictMode>
)
