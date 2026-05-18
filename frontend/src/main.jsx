import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store/store'
import { ToastContainer, Slide } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
        <ToastContainer 
          position="top-center"
          autoClose={2500}
          transition={Slide}
          hideProgressBar={true}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastStyle={{ 
            backgroundColor: '#261914', 
            color: '#fdf8f6', 
            borderRadius: '12px', 
            border: '1px solid #473129',
            fontFamily: 'Inter, sans-serif'
          }}
        />
      </PersistGate>
    </Provider>
  </StrictMode>,
)
