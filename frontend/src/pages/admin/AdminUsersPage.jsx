// CAELINUS AI - Admin Users Dashboard
// Kullanıcı Analytics ve Yönetimi

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import axios from 'axios';
import {
  Users, Crown, TrendingUp, AlertCircle, Search,
  ChevronLeft, ChevronRight, Eye, Trash2, UserX,
  BarChart3, Activity, Shield, ArrowLeft
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Stats Card Component
const StatCard = ({ icon: Icon, title, value, subValue, trend, color }) => (
  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-white/50 text-sm">{title}</span>
    </div>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-semibold text-white">{value}</span>
      {subValue && (
        <span className="text-white/40 text-sm mb-1">{subValue}</span>
      )}
    </div>
    {trend && (
      <div className="mt-2 text-xs text-green-400">
        <TrendingUp className="w-3 h-3 inline mr-1" />
        {trend}
      </div>
    )}
  </div>
);

// Distribution Chart (simple bar)
const DistributionChart = ({ data, title }) => {
  if (!data || data.length === 0) return null;
  const maxCount = Math.max(...data.map(d => d.count));
  
  return (
    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
      <h3 className="text-white/70 text-sm mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60">{item.reason || item.purpose || item.style || item.lang}</span>
              <span className="text-white/40">{item.count}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterPremium, setFilterPremium] = useState('all');
  const [filterAuthType, setFilterAuthType] = useState('all');
  
  // Dialogs
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAnonymizeDialog, setShowAnonymizeDialog] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [premiumPlan, setPremiumPlan] = useState('monthly');

  // Check admin auth
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Fetch dashboard
  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/api/admin/users/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboard(response.data);
    } catch (error) {
      console.error('Dashboard error:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    }
  };

  // Fetch users
  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (search) params.append('search', search);
      if (filterPremium !== 'all') params.append('is_premium', filterPremium === 'premium');
      if (filterAuthType !== 'all') params.append('auth_type', filterAuthType);
      
      const response = await axios.get(`${API_URL}/api/admin/users/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data.users);
      setTotalUsers(response.data.total);
      setTotalPages(response.data.pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Users fetch error:', error);
      toast.error('Kullanıcılar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchUsers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filterPremium, filterAuthType]);

  // Actions
  const handleSetPremium = async (isPremium) => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API_URL}/api/admin/users/${selectedUser.user_id}/premium`,
        {
          is_premium: isPremium,
          premium_plan: isPremium ? premiumPlan : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(isPremium ? 'Premium aktif edildi' : 'Premium kaldırıldı');
      setShowPremiumDialog(false);
      fetchUsers(currentPage);
      fetchDashboard();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${API_URL}/api/admin/users/${selectedUser.user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Kullanıcı silindi');
      setShowDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers(currentPage);
      fetchDashboard();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    }
  };

  const handleAnonymize = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${API_URL}/api/admin/users/${selectedUser.user_id}/anonymize`,
        { confirm: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Kullanıcı anonimleştirildi');
      setShowAnonymizeDialog(false);
      setSelectedUser(null);
      fetchUsers(currentPage);
    } catch (error) {
      toast.error('Anonimleştirme başarısız');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link 
            to="/admin"
            className="flex items-center gap-2 text-white/40 hover:text-white/60 text-sm mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin Panel
          </Link>
          <h1 className="text-2xl font-light text-white">Kullanıcı Yönetimi</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => { fetchDashboard(); fetchUsers(currentPage); }}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            Yenile
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            title="Toplam Kullanıcı"
            value={dashboard.users.total}
            subValue={`${dashboard.users.new_7d} yeni (7 gün)`}
            color="bg-indigo-500/20"
          />
          <StatCard
            icon={Crown}
            title="Premium Kullanıcı"
            value={dashboard.users.premium}
            subValue={`%${dashboard.users.conversion_rate} dönüşüm`}
            color="bg-amber-500/20"
          />
          <StatCard
            icon={BarChart3}
            title="Profil Tamamlama"
            value={`%${dashboard.profiles.completion_rate}`}
            subValue={`${dashboard.profiles.completed} profil`}
            color="bg-emerald-500/20"
          />
          <StatCard
            icon={Activity}
            title="Ses Başarı Oranı"
            value={`%${dashboard.activity.audio_success_rate}`}
            subValue={`${dashboard.activity.events_7d} event (7 gün)`}
            color="bg-violet-500/20"
          />
        </div>
      )}

      {/* Charts Row */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <DistributionChart 
            data={dashboard.profiles.top_reasons} 
            title="Geliş Nedenleri" 
          />
          <DistributionChart 
            data={dashboard.profiles.top_purposes} 
            title="Kullanım Amaçları" 
          />
          <DistributionChart 
            data={dashboard.profiles.top_styles} 
            title="İletişim Tercihleri" 
          />
        </div>
      )}

      {/* Errors Section */}
      {dashboard?.errors?.recent?.length > 0 && (
        <div className="mb-8 bg-red-500/10 rounded-xl p-4 border border-red-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-white/70 text-sm">Son Hatalar ({dashboard.errors.count_7d})</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {dashboard.errors.recent.slice(0, 3).map((err, i) => (
              <div key={i} className="text-xs text-white/50">
                <span className="text-red-400">{err.source}</span>: {err.message?.slice(0, 100)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-white/10 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="E-posta veya isim ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          
          <Select value={filterPremium} onValueChange={setFilterPremium}>
            <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Premium" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="free">Ücretsiz</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterAuthType} onValueChange={setFilterAuthType}>
            <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Auth Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="email">E-posta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/50 text-xs font-medium">KULLANICI</th>
                <th className="text-left p-4 text-white/50 text-xs font-medium">AUTH</th>
                <th className="text-left p-4 text-white/50 text-xs font-medium">PROFİL</th>
                <th className="text-left p-4 text-white/50 text-xs font-medium">DURUM</th>
                <th className="text-left p-4 text-white/50 text-xs font-medium">KAYIT</th>
                <th className="text-right p-4 text-white/50 text-xs font-medium">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/40">
                    Yükleniyor...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/40">
                    Kullanıcı bulunamadı
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.user_id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.picture ? (
                          <img 
                            src={user.picture} 
                            alt="" 
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <span className="text-white/50 text-xs">
                              {user.name?.[0] || user.email?.[0] || '?'}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-white text-sm">{user.name || 'İsimsiz'}</div>
                          <div className="text-white/40 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.auth_type === 'google' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {user.auth_type}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.profile ? (
                        <div className="text-xs">
                          <span className="text-white/60">{user.profile.style_preference}</span>
                          <span className="text-white/30 mx-1">•</span>
                          <span className="text-white/40">{user.profile.language?.toUpperCase()}</span>
                        </div>
                      ) : (
                        <span className="text-white/30 text-xs">Profil yok</span>
                      )}
                    </td>
                    <td className="p-4">
                      {user.is_premium ? (
                        <span className="flex items-center gap-1 text-amber-400 text-xs">
                          <Crown className="w-3 h-3" />
                          Premium
                        </span>
                      ) : (
                        <span className="text-white/30 text-xs">Ücretsiz</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-white/40 text-xs">
                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => { setSelectedUser(user); setShowPremiumDialog(true); }}
                          className="h-8 w-8 text-white/40 hover:text-amber-400 hover:bg-amber-500/10"
                          title="Premium Yönet"
                        >
                          <Crown className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => { setSelectedUser(user); setShowAnonymizeDialog(true); }}
                          className="h-8 w-8 text-white/40 hover:text-blue-400 hover:bg-blue-500/10"
                          title="Anonimleştir"
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => { setSelectedUser(user); setShowDeleteDialog(true); }}
                          className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-white/40 text-sm">
              Toplam {totalUsers} kullanıcı
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => fetchUsers(currentPage - 1)}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 py-1 text-white/60 text-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => fetchUsers(currentPage + 1)}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1a1a24] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Kullanıcıyı Sil</DialogTitle>
            <DialogDescription className="text-white/60">
              <strong>{selectedUser?.email}</strong> kullanıcısını ve tüm verilerini silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Anonymize Dialog */}
      <Dialog open={showAnonymizeDialog} onOpenChange={setShowAnonymizeDialog}>
        <DialogContent className="bg-[#1a1a24] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Kullanıcıyı Anonimleştir</DialogTitle>
            <DialogDescription className="text-white/60">
              <strong>{selectedUser?.email}</strong> kullanıcısının kişisel verileri hashlenecek.
              İstatistik verileri korunacak ancak kimlik bilgileri silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnonymizeDialog(false)}>
              İptal
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={handleAnonymize}
            >
              Anonimleştir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Premium Dialog */}
      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent className="bg-[#1a1a24] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Premium Yönetimi</DialogTitle>
            <DialogDescription className="text-white/60">
              <strong>{selectedUser?.email}</strong> için premium durumunu yönetin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-white/60 text-sm mb-2 block">Plan Seçin</label>
            <Select value={premiumPlan} onValueChange={setPremiumPlan}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Aylık</SelectItem>
                <SelectItem value="yearly">Yıllık</SelectItem>
                <SelectItem value="lifetime">Ömür Boyu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPremiumDialog(false)}>
              İptal
            </Button>
            {selectedUser?.is_premium ? (
              <Button 
                variant="destructive"
                onClick={() => handleSetPremium(false)}
              >
                Premium Kaldır
              </Button>
            ) : (
              <Button 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => handleSetPremium(true)}
              >
                Premium Yap
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersPage;
