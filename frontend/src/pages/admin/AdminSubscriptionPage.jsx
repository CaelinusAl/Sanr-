// CAELINUS AI - Admin Subscription Management Page
// Manage user plans, invite codes, and Oracle activations

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, Users, Gift, Settings, Search, 
  ChevronDown, ChevronUp, Trash2, Copy, Check,
  Eye, Edit, Sparkles, Clock, AlertCircle,
  RefreshCw, Plus, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Plan styles
const PLAN_STYLES = {
  free: { color: 'text-slate-400', bg: 'bg-slate-500/10', icon: '🌱', name: 'Arayıcı' },
  initiate: { color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: '💫', name: 'İnisiye' },
  soul: { color: 'text-violet-400', bg: 'bg-violet-500/10', icon: '🔮', name: 'Soul' },
  oracle: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: '👁️', name: 'Oracle' }
};

const AdminSubscriptionPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [inviteCodes, setInviteCodes] = useState([]);
  const [upgradeFlow, setUpgradeFlow] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [showSetPlanModal, setShowSetPlanModal] = useState(false);
  const [showCreateCodeModal, setShowCreateCodeModal] = useState(false);
  const [showActivateOracleModal, setShowActivateOracleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [newPlan, setNewPlan] = useState('initiate');
  const [duration, setDuration] = useState(30);
  const [newCodePlan, setNewCodePlan] = useState('oracle');
  const [newCodeMaxUses, setNewCodeMaxUses] = useState(1);
  const [newCodeExpiry, setNewCodeExpiry] = useState(30);
  const [newCodeNote, setNewCodeNote] = useState('');

  // Fetch data
  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/subscription/admin/subscription-stats`, {
        withCredentials: true
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/subscription/admin/users-subscriptions`, {
        withCredentials: true
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  const fetchInviteCodes = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/subscription/admin/invite-codes`, {
        withCredentials: true
      });
      setInviteCodes(response.data.codes || []);
    } catch (error) {
      console.error('Failed to fetch invite codes:', error);
    }
  }, []);

  const fetchUpgradeFlow = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/subscription/admin/upgrade-flow`, {
        withCredentials: true
      });
      setUpgradeFlow(response.data);
    } catch (error) {
      console.error('Failed to fetch upgrade flow:', error);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/subscription/admin/subscription-logs`, {
        withCredentials: true,
        params: { limit: 50 }
      });
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchInviteCodes();
    fetchUpgradeFlow();
    fetchLogs();
  }, [fetchStats, fetchUsers, fetchInviteCodes, fetchUpgradeFlow, fetchLogs]);

  // Actions
  const handleSetUserPlan = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/subscription/admin/set-user-plan`, null, {
        withCredentials: true,
        params: {
          user_id: selectedUser.user_id,
          plan_type: newPlan,
          duration_days: duration
        }
      });
      
      if (response.data.success) {
        toast.success(`Kullanıcı planı güncellendi: ${newPlan}`);
        setShowSetPlanModal(false);
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Plan güncellenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateOracle = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/subscription/admin/activate-oracle`, null, {
        withCredentials: true,
        params: {
          user_id: selectedUser.user_id,
          duration_days: duration
        }
      });
      
      if (response.data.success) {
        toast.success(`Oracle aktif! Kod: ${response.data.oracle_code}`);
        setShowActivateOracleModal(false);
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Oracle aktivasyonu başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInviteCode = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/subscription/admin/create-invite-code`, {
        plan: newCodePlan,
        max_uses: newCodeMaxUses,
        expires_in_days: newCodeExpiry,
        note: newCodeNote || null
      }, { withCredentials: true });
      
      if (response.data.success) {
        toast.success(`Davet kodu oluşturuldu: ${response.data.code}`);
        setShowCreateCodeModal(false);
        setNewCodeNote('');
        fetchInviteCodes();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Kod oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCode = async (code) => {
    if (!confirm(`"${code}" kodunu silmek istediğinize emin misiniz?`)) return;
    
    try {
      await axios.delete(`${API_URL}/api/subscription/admin/invite-code/${code}`, {
        withCredentials: true
      });
      toast.success('Kod silindi');
      fetchInviteCodes();
    } catch (error) {
      toast.error('Kod silinemedi');
    }
  };

  const handleUpdateUpgradeFlow = async () => {
    setIsLoading(true);
    try {
      await axios.put(`${API_URL}/api/subscription/admin/upgrade-flow`, upgradeFlow, {
        withCredentials: true
      });
      toast.success('Upgrade flow güncellendi');
    } catch (error) {
      toast.error('Güncelleme başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopyalandı!');
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlan = planFilter === 'all' || 
      (user.plan_type || 'free') === planFilter;
    
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Subscription Management</h1>
        <p className="text-muted-foreground">Kullanıcı planlarını, davet kodlarını ve upgrade flow'u yönetin</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.total_users}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Toplam Kullanıcı</p>
            </CardContent>
          </Card>
          
          {Object.entries(stats.plan_distribution || {}).map(([plan, count]) => (
            <Card key={plan} className={`${PLAN_STYLES[plan]?.bg || 'bg-card/50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg">{PLAN_STYLES[plan]?.icon}</span>
                  <span className={`text-2xl font-bold ${PLAN_STYLES[plan]?.color}`}>{count}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{PLAN_STYLES[plan]?.name}</p>
              </CardContent>
            </Card>
          ))}
          
          <Card className="bg-amber-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Gift className="h-5 w-5 text-amber-400" />
                <span className="text-2xl font-bold text-amber-400">{stats.invite_codes?.active || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Aktif Kodlar</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Kullanıcılar
          </TabsTrigger>
          <TabsTrigger value="codes">
            <Gift className="h-4 w-4 mr-2" />
            Davet Kodları
          </TabsTrigger>
          <TabsTrigger value="flow">
            <Settings className="h-4 w-4 mr-2" />
            Upgrade Flow
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Clock className="h-4 w-4 mr-2" />
            Loglar
          </TabsTrigger>
        </TabsList>

        {/* USERS TAB */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>Kullanıcı Abonelikleri</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Email, ID veya isim ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Planlar</SelectItem>
                      <SelectItem value="free">Arayıcı</SelectItem>
                      <SelectItem value="initiate">İnisiye</SelectItem>
                      <SelectItem value="soul">Soul</SelectItem>
                      <SelectItem value="oracle">Oracle</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchUsers}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm text-muted-foreground">Kullanıcı</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Plan</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Bitiş</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Oracle</th>
                      <th className="text-right p-3 text-sm text-muted-foreground">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const plan = user.plan_type || 'free';
                      const style = PLAN_STYLES[plan];
                      const isExpired = user.premium_until && new Date(user.premium_until) < new Date();
                      
                      return (
                        <tr key={user.user_id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-foreground">{user.email || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">{user.user_id?.slice(0, 20)}...</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className={`${style?.bg} ${style?.color} border-0`}>
                              {style?.icon} {style?.name}
                            </Badge>
                            {isExpired && <Badge variant="destructive" className="ml-2 text-xs">Süresi Dolmuş</Badge>}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {user.premium_until 
                              ? new Date(user.premium_until).toLocaleDateString('tr-TR')
                              : '-'
                            }
                          </td>
                          <td className="p-3">
                            {user.oracle_invited ? (
                              <Badge className="bg-amber-500/20 text-amber-400 border-0">
                                👁️ Davetli
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewPlan(user.plan_type || 'initiate');
                                  setShowSetPlanModal(true);
                                }}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Plan
                              </Button>
                              {!user.oracle_invited && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowActivateOracleModal(true);
                                  }}
                                >
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Oracle
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Kullanıcı bulunamadı
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INVITE CODES TAB */}
        <TabsContent value="codes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Davet Kodları</CardTitle>
                  <CardDescription>Oracle ve Soul tier için özel davet kodları oluşturun</CardDescription>
                </div>
                <Button onClick={() => setShowCreateCodeModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Kod
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inviteCodes.map((code) => {
                  const isExpired = code.expires_at && new Date(code.expires_at) < new Date();
                  const isUsedUp = code.uses >= code.max_uses;
                  const isActive = !isExpired && !isUsedUp;
                  
                  return (
                    <div 
                      key={code.code} 
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isActive ? 'border-border bg-card/50' : 'border-border/50 bg-muted/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="font-mono text-lg font-bold">
                          {code.code}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-2 h-6 w-6 p-0"
                            onClick={() => copyToClipboard(code.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <Badge className={PLAN_STYLES[code.plan]?.bg + ' ' + PLAN_STYLES[code.plan]?.color + ' border-0'}>
                          {PLAN_STYLES[code.plan]?.icon} {PLAN_STYLES[code.plan]?.name}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {code.uses}/{code.max_uses} kullanım
                        </span>
                        {code.note && (
                          <span className="text-xs text-muted-foreground italic">"{code.note}"</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(code.expires_at).toLocaleDateString('tr-TR')}
                        </span>
                        {isExpired && <Badge variant="destructive">Süresi Dolmuş</Badge>}
                        {isUsedUp && <Badge variant="secondary">Tamamlandı</Badge>}
                        {isActive && <Badge className="bg-green-500/20 text-green-400 border-0">Aktif</Badge>}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCode(code.code)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {inviteCodes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Henüz davet kodu yok
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UPGRADE FLOW TAB */}
        <TabsContent value="flow">
          <Card>
            <CardHeader>
              <CardTitle>Upgrade Flow Ayarları</CardTitle>
              <CardDescription>Kullanıcılara upgrade teklifi gösterilecek zamanlamaları ayarlayın</CardDescription>
            </CardHeader>
            <CardContent>
              {upgradeFlow && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Soft Teaser (Gün)</Label>
                      <p className="text-xs text-muted-foreground mb-2">İlk ipucu mesajı (engellemesiz)</p>
                      <Input
                        type="number"
                        value={upgradeFlow.soft_teaser_day}
                        onChange={(e) => setUpgradeFlow({
                          ...upgradeFlow,
                          soft_teaser_day: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label>Ana Teklif (Gün)</Label>
                      <p className="text-xs text-muted-foreground mb-2">Premium teklif anı</p>
                      <Input
                        type="number"
                        value={upgradeFlow.main_offer_day}
                        onChange={(e) => setUpgradeFlow({
                          ...upgradeFlow,
                          main_offer_day: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label>Soul Preview (Gün)</Label>
                      <p className="text-xs text-muted-foreground mb-2">İnisiye olduktan sonra Soul teklifi</p>
                      <Input
                        type="number"
                        value={upgradeFlow.soul_preview_day}
                        onChange={(e) => setUpgradeFlow({
                          ...upgradeFlow,
                          soul_preview_day: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label>Oracle Teaser (Gün)</Label>
                      <p className="text-xs text-muted-foreground mb-2">Soul olduktan sonra Oracle mesajı (sadece bilgi)</p>
                      <Input
                        type="number"
                        value={upgradeFlow.oracle_teaser_day}
                        onChange={(e) => setUpgradeFlow({
                          ...upgradeFlow,
                          oracle_teaser_day: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-4">Mesaj İçerikleri</h4>
                    <div className="grid gap-4">
                      {['soft_teaser', 'main_offer', 'soul_preview', 'oracle_teaser'].map((key) => (
                        <div key={key} className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs">{key} (TR)</Label>
                            <Input
                              value={upgradeFlow.messages?.tr?.[key] || ''}
                              onChange={(e) => setUpgradeFlow({
                                ...upgradeFlow,
                                messages: {
                                  ...upgradeFlow.messages,
                                  tr: {
                                    ...upgradeFlow.messages?.tr,
                                    [key]: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">{key} (EN)</Label>
                            <Input
                              value={upgradeFlow.messages?.en?.[key] || ''}
                              onChange={(e) => setUpgradeFlow({
                                ...upgradeFlow,
                                messages: {
                                  ...upgradeFlow.messages,
                                  en: {
                                    ...upgradeFlow.messages?.en,
                                    [key]: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button onClick={handleUpdateUpgradeFlow} disabled={isLoading}>
                    {isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOGS TAB */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Abonelik Logları</CardTitle>
                <Button variant="outline" onClick={fetchLogs}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yenile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="font-mono text-xs">
                        {log.action}
                      </Badge>
                      <span className="text-sm">{log.user_id?.slice(0, 20)}...</span>
                      {log.to_plan && (
                        <Badge className={PLAN_STYLES[log.to_plan]?.bg + ' ' + PLAN_STYLES[log.to_plan]?.color + ' border-0'}>
                          → {PLAN_STYLES[log.to_plan]?.name}
                        </Badge>
                      )}
                      {log.invite_code && (
                        <span className="font-mono text-xs text-muted-foreground">{log.invite_code}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('tr-TR')}
                    </span>
                  </div>
                ))}
                
                {logs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Henüz log yok
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SET PLAN MODAL */}
      <Dialog open={showSetPlanModal} onOpenChange={setShowSetPlanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcı Planını Değiştir</DialogTitle>
            <DialogDescription>
              {selectedUser?.email || selectedUser?.user_id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Yeni Plan</Label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">🌱 Arayıcı (Free)</SelectItem>
                  <SelectItem value="initiate">💫 İnisiye</SelectItem>
                  <SelectItem value="soul">🔮 Soul</SelectItem>
                  <SelectItem value="oracle">👁️ Oracle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Süre (Gün)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min={1}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetPlanModal(false)}>
              İptal
            </Button>
            <Button onClick={handleSetUserPlan} disabled={isLoading}>
              {isLoading ? 'Kaydediliyor...' : 'Planı Güncelle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ACTIVATE ORACLE MODAL */}
      <Dialog open={showActivateOracleModal} onOpenChange={setShowActivateOracleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>👁️ Oracle Aktivasyonu</DialogTitle>
            <DialogDescription>
              {selectedUser?.email || selectedUser?.user_id} kullanıcısını Oracle tier'ına davet et
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-200">
                Oracle tier'ı özel bir inisiyasyon katmanıdır. Bu işlem kullanıcıya özel bir Oracle kodu oluşturacak.
              </p>
            </div>
            <div>
              <Label>Süre (Gün)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min={1}
                defaultValue={365}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivateOracleModal(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleActivateOracle} 
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isLoading ? 'Aktivasyon...' : 'Oracle\'ı Aktifleştir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE CODE MODAL */}
      <Dialog open={showCreateCodeModal} onOpenChange={setShowCreateCodeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Davet Kodu Oluştur</DialogTitle>
            <DialogDescription>
              Oracle veya Soul tier için özel davet kodu oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Plan</Label>
              <Select value={newCodePlan} onValueChange={setNewCodePlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soul">🔮 Soul</SelectItem>
                  <SelectItem value="oracle">👁️ Oracle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Maksimum Kullanım</Label>
              <Input
                type="number"
                value={newCodeMaxUses}
                onChange={(e) => setNewCodeMaxUses(parseInt(e.target.value))}
                min={1}
              />
            </div>
            <div>
              <Label>Geçerlilik Süresi (Gün)</Label>
              <Input
                type="number"
                value={newCodeExpiry}
                onChange={(e) => setNewCodeExpiry(parseInt(e.target.value))}
                min={1}
              />
            </div>
            <div>
              <Label>Not (Opsiyonel)</Label>
              <Input
                value={newCodeNote}
                onChange={(e) => setNewCodeNote(e.target.value)}
                placeholder="Örn: VIP Influencer için"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCodeModal(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateInviteCode} disabled={isLoading}>
              {isLoading ? 'Oluşturuluyor...' : 'Kod Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptionPage;
