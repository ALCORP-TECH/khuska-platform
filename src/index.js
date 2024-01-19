import React from 'react';
import { Provider } from 'react-redux';

import ReactDOM from 'react-dom/client';
import App from 'App';
import { store } from 'store';

// style + assets
import 'assets/scss/style.scss';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
