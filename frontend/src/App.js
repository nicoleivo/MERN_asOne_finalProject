import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { QueryClient, QueryClientProvider } from 'react-query';

import Header from './components/Header';
import Footer from './components/Footer';
import CategoryHeader from './components/CategoryHeader';
import FaqList from '../src/components/FaqList';
import FaqCreate from './components/FaqCreate';
import FaqDetails from './components/FaqDetails';

import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen.js';
import UserAdsScreen from './screens/UserAdsScreen';
import ProductsByCategoryScreen from './screens/ProductsByCategoryScreen';
import FaqScreen from './screens/FaqScreen';
import UserWishlistScreen from './screens/UserWishlistScreen';
import MyRentsScreen from './screens/MyRentsScreen';
import ChatScreen from './screens/ChatScreen';
import UserAdsScreenPublic from './screens/UserAdsScreenPublic';

const App = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <main>
        <Container>
          <CategoryHeader />
          <Routes>
            <Route path='/login' element={<LoginScreen />} />
            <Route path='/register' element={<RegisterScreen />} />
            <Route path='/profile' element={<ProfileScreen />} />
            <Route path='/product/:id' element={<ProductScreen />} />
            <Route path='/admin/userlist' element={<UserListScreen />} />
            <Route path='/admin/users/:id/edit' element={<UserEditScreen />} />
            <Route path='/admin/productlist' element={<ProductListScreen />}>
              <Route path=':pageNumber' element={<ProductListScreen />} />
              <Route path='' element={<ProductListScreen />} />
            </Route>

            <Route path='/products/:id/edit' element={<ProductEditScreen />} />

            {/* ...........ProductsByCategoryScreen................. */}
            <Route
              path='/productssearch/:keyword'
              element={<ProductsByCategoryScreen />}
            />
            <Route
              path='/productssearch/:keyword/:pageNumber'
              element={<ProductsByCategoryScreen />}
            />
            <Route
              path='/products/category/:keyword/page/:pageNumber'
              element={<ProductsByCategoryScreen />}
            />
            <Route
              path='/products/category/:keyword'
              element={<ProductsByCategoryScreen />}
              exact
            />

            <Route path='/' element={<HomeScreen />}>
              <Route path='search/:keyword' element={<HomeScreen />} />
              <Route path='page/:pageNumber' element={<HomeScreen />} />
              <Route
                path='search:keyword/page/:pageNumber'
                element={<HomeScreen />}
              />
            </Route>

            {/* Route for help button (faq) */}
            <Route path='/faq' element={<FaqScreen />} />
            <Route path='faq/page/:pageNumber' element={<FaqScreen />} />
            <Route path='/faqList' element={<FaqList />} exact />
            <Route path='/faqList/:pageNumber' element={<FaqList />} exact />
            <Route path='/faq/:id/edit' element={<FaqCreate />} />
            <Route path='/faq/:id' element={<FaqDetails />} />

            {/* faq search */}
            <Route path='/faq/search/:keyword' element={<FaqScreen />} exact />
            <Route
              path='/faq/search/:keyword/page/:pageNumber'
              element={<FaqScreen />}
            />

            {/* user Wishlist Screen */}
            <Route path='/wishlist' element={<UserWishlistScreen />} />
            <Route path='/myrents' element={<MyRentsScreen />} />

            {/* user Add Screen */}
            <Route path='/useradd' element={<UserAdsScreen />} exact />
            <Route path='/useradd/:userId' element={<UserAdsScreen />} exact />

            {/* Chat */}
            <Route path='/chat' element={<ChatScreen />} />

            {/* userAdsScreenPublic */}
            <Route
              path='/useradspublic/:id'
              element={<UserAdsScreenPublic />}
            />
          </Routes>
        </Container>
      </main>
      <Footer />
    </QueryClientProvider>
  );
};

export default App;
