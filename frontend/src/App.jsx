import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import UserLayout from './layouts/UserLayout';
import PublicLayout from './layouts/PublicLayout';
import Dashboard from './views/dashboard/Dashboard';
import RankingManagement from './views/dashboard/RankingManagement';
import TorneosManagement from './views/dashboard/TorneosManagement';
import TorneoZonasAdmin from './views/dashboard/TorneoZonasAdmin';
import ZonasSelector from './views/dashboard/ZonasSelector';
import PointsSelector from './views/dashboard/PointsSelector';
import PointsManagement from './views/dashboard/PointsManagement';
import ClassificationSelector from './views/dashboard/ClassificationSelector';
import ClassificationManagement from './views/dashboard/ClassificationManagement';
import UserProfile from './views/user/UserProfile';
import UserStats from './views/user/UserStats';
import UserInscripcion from './views/user/UserInscripcion';
import UserPareja from './views/user/UserPareja';
import Home from './views/Home';
import Ranking from './views/Ranking';
import AllEvents from './views/AllEvents';
import TournamentClassification from './views/TournamentClassification';
import TournamentBrackets from './views/TournamentBrackets';
import TournamentInfo from './views/TournamentInfo';
import CircuitView from './views/CircuitView';
import CircuitManagement from './views/dashboard/CircuitManagement';
import VenuesView from './views/VenuesView';
import GalleryView from './views/GalleryView';
import VenuesManagement from './views/dashboard/VenuesManagement';
import GalleryManagement from './views/dashboard/GalleryManagement';
import SponsorsManagement from './views/dashboard/SponsorsManagement';
import CartelesManagement from './views/dashboard/CartelesManagement';
import CommentsManagement from './views/dashboard/CommentsManagement';
import PlayerStatsManagement from './views/dashboard/PlayerStatsManagement';
import NewsManagement from './views/dashboard/NewsManagement';
import PlayersView from './views/PlayersView';
import PlayerDetailView from './views/PlayerDetailView';
import NewsDetailView from './views/NewsDetailView';
import Recategorizaciones from './views/Recategorizaciones';
import RecategorizacionesManagement from './views/dashboard/RecategorizacionesManagement';
import ScrollToTop from './utils/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { HeaderProvider } from './context/HeaderContext';

function App() {
  return (
    <AuthProvider>
      <HeaderProvider>
        <Router>
          <ScrollToTop />
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/eventos" element={<PublicLayout><AllEvents /></PublicLayout>} />
          <Route path="/ranking" element={<PublicLayout><Ranking /></PublicLayout>} />
          <Route path="/torneos/:id/clasificacion" element={<PublicLayout><TournamentClassification /></PublicLayout>} />
          <Route path="/torneos/:id/llave" element={<PublicLayout><TournamentBrackets /></PublicLayout>} />
          <Route path="/torneos/:id/info" element={<PublicLayout><TournamentInfo /></PublicLayout>} />
          <Route path="/circuito" element={<PublicLayout><CircuitView /></PublicLayout>} />
          <Route path="/sedes" element={<PublicLayout><VenuesView /></PublicLayout>} />
          <Route path="/fotos" element={<PublicLayout><GalleryView /></PublicLayout>} />
          <Route path="/jugadores" element={<PublicLayout><PlayersView /></PublicLayout>} />
          <Route path="/jugadores/:dni" element={<PublicLayout><PlayerDetailView /></PublicLayout>} />
          <Route path="/noticias/:id" element={<PublicLayout><NewsDetailView /></PublicLayout>} />
          <Route path="/recategorizaciones" element={<PublicLayout><Recategorizaciones /></PublicLayout>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/admin/ranking" element={<MainLayout><RankingManagement /></MainLayout>} />
          <Route path="/admin/torneos" element={<MainLayout><TorneosManagement /></MainLayout>} />
          <Route path="/admin/circuito" element={<MainLayout><CircuitManagement /></MainLayout>} />
          <Route path="/admin/sedes" element={<MainLayout><VenuesManagement /></MainLayout>} />
          <Route path="/admin/carteles" element={<MainLayout><CartelesManagement /></MainLayout>} />
          <Route path="/admin/galeria" element={<MainLayout><GalleryManagement /></MainLayout>} />
          <Route path="/admin/sponsors" element={<MainLayout><SponsorsManagement /></MainLayout>} />
          <Route path="/admin/comentarios" element={<MainLayout><CommentsManagement /></MainLayout>} />
          <Route path="/admin/noticias" element={<MainLayout><NewsManagement /></MainLayout>} />
          <Route path="/admin/jugadores" element={<MainLayout><PlayerStatsManagement /></MainLayout>} />
          <Route path="/admin/zonas" element={<MainLayout><ZonasSelector /></MainLayout>} />
          <Route path="/admin/torneos/:id/zonas" element={<MainLayout><TorneoZonasAdmin /></MainLayout>} />
          <Route path="/admin/puntos" element={<MainLayout><PointsSelector /></MainLayout>} />
          <Route path="/admin/torneos/:id/puntos" element={<MainLayout><PointsManagement /></MainLayout>} />
          <Route path="/admin/clasificacion" element={<MainLayout><ClassificationSelector /></MainLayout>} />
          <Route path="/admin/torneos/:id/clasificacion-admin" element={<MainLayout><ClassificationManagement /></MainLayout>} />
          <Route path="/admin/recategorizaciones" element={<MainLayout><RecategorizacionesManagement /></MainLayout>} />

          {/* User Panel Routes */}
          <Route path="/control" element={<UserLayout><UserProfile /></UserLayout>} />
          <Route path="/control/estadisticas" element={<UserLayout><UserStats /></UserLayout>} />
          <Route path="/control/inscripcion" element={<UserLayout><UserInscripcion /></UserLayout>} />
          <Route path="/control/pareja" element={<UserLayout><UserPareja /></UserLayout>} />

          {/* Redirect any other path to / for now */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </HeaderProvider>
    </AuthProvider>
  );
}

export default App;
