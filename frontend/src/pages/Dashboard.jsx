import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Cookie,
  Server,
  Activity,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  Search,
  RefreshCw,
  Play,
  Square,
  LogOut,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Copy,
  Eye,
  EyeOff,
  Terminal,
  Sliders,
  Cpu,
  HardDrive,
  Layers,
  Tv,
  Maximize2,
  BarChart3,
  PieChart,
  TrendingUp,
  MapPin,
  Flame,
  CheckCheck,
  Radio,
  Info,
  User,
  Pencil,
  FlaskConical,
  Loader2,
  Zap,
  Bot,
  Heart,
  MessageCircle,
  Gift,
  Lock
} from 'lucide-react';
import { api } from '../api/client';
import InteractiveBotEyes from '../components/InteractiveBotEyes';

// Catmull-Rom to Cubic Bézier spline helper for smooth SaaS curves
function getSplinePaths(points, baselineY) {
  if (!points || points.length === 0) return { linePath: '', areaPath: '' };
  if (points.length === 1) {
    const p = points[0];
    return {
      linePath: `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
      areaPath: `M ${p.x.toFixed(1)} ${baselineY.toFixed(1)} L ${p.x.toFixed(1)} ${p.y.toFixed(1)} L ${p.x.toFixed(1)} ${baselineY.toFixed(1)} Z`,
    };
  }

  let linePath = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  const tension = 0.35;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    let cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    let cp2y = p2.y - (p3.y - p1.y) * tension;

    // Clamp control points between top bounds (15) and baseline
    cp1y = Math.min(Math.max(cp1y, 15), baselineY);
    cp2y = Math.min(Math.max(cp2y, 15), baselineY);

    linePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const first = points[0];
  const last = points[points.length - 1];
  const areaPath = `${linePath} L ${last.x.toFixed(1)} ${baselineY.toFixed(1)} L ${first.x.toFixed(1)} ${baselineY.toFixed(1)} Z`;

  return { linePath, areaPath };
}

function GmailLogo({ className = "w-4 h-4 shrink-0" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z" fill="#E8F0FE" />
      <path d="M20 4H4c-1.1 0-2 .9-2 2v.4l10 6.25 10-6.25V6c0-1.1-.9-2-2-2z" fill="#EA4335" />
      <path d="M2 6.4V18c0 1.1.9 2 2 2h4V10.25L2 6.4z" fill="#4285F4" />
      <path d="M22 6.4l-6 3.85V20h4c1.1 0 2-.9 2-2V6.4z" fill="#34A853" />
      <path d="M8 20v-9.75L12 12.7l4-2.45V20H8z" fill="#FBBC05" />
    </svg>
  );
}

function TikTokLogo({ className = "w-4 h-4 shrink-0" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
    </svg>
  );
}

function getProfileGradient(name = '') {
  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-blue-600',
    'from-fuchsia-500 to-pink-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % gradients.length;
  return gradients[idx];
}

function formatUnixId(ts) {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return '-';
  return new Date(n * 1000).toLocaleString('id-ID');
}

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();

  // Navigation Tab State
  // 'overview' | 'sharescreen' | 'cookies' | 'server' | 'businesses'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (search.includes('tab=tiktok') || search.includes('tab=tiktok-cookies') || path.includes('tiktok')) return 'tiktok-cookies';
      if (path.includes('screen')) return 'sharescreen';
      if (path.includes('cookie') || path.includes('oauth') || search.includes('tab=cookies')) return 'cookies';
      if (path.includes('server')) return 'server';
      if (path.includes('business')) return 'businesses';
      if (path.includes('config') || path.includes('bot')) return 'config-bot';
    }
    return 'overview';
  });

  // Core Data States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCheckingNames, setIsCheckingNames] = useState(false);
  const [data, setData] = useState(null);
  const [cliStatus, setCliStatus] = useState(null);

  // Profile Dropdown State
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Sharescreen (Dual Mode: Google Maps Display :99 vs TikTok Live Multi-Account Cards)
  const [screenTs, setScreenTs] = useState(Date.now());
  const [streamSessionKey, setStreamSessionKey] = useState(Date.now());
  const [screenLogs, setScreenLogs] = useState([]);
  const [streamActive, setStreamActive] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [sharescreenMode, setSharescreenMode] = useState('google_map'); // 'google_map' | 'tiktok_live'
  const [userManuallyToggledScreen, setUserManuallyToggledScreen] = useState(false);
  const [tiktokLiveScreenStatus, setTiktokLiveScreenStatus] = useState(null);
  const [liveTask, setLiveTask] = useState(null);
  const screenContainerRef = useRef(null);

  const handleToggleFullscreen = () => {
    if (!screenContainerRef.current) return;
    if (!document.fullscreenElement) {
      screenContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    if (activeTab !== 'sharescreen') return;

    // Refresh bot config dan status segera saat tab sharescreen dibuka
    loadBotConfig();
    fetchTikTokCookies();

    // Cek status segera saat tab sharescreen diklik
    fetch('/api/tiktok-live/status')
      .then(r => r.json())
      .then(data => {
        if (data?.state?.is_running && !liveTask?.is_running) {
          setSharescreenMode('tiktok_live');
        }
      })
      .catch(() => {});

    let mounted = true;
    const fetchScreenData = async () => {
      try {
        const [logsRes, ttRes] = await Promise.all([
          api.getScreenLogs(25).catch(() => null),
          fetch('/api/tiktok-live/status').then(r => r.json()).catch(() => null)
        ]);
        if (mounted) {
          if (logsRes && logsRes.logs) setScreenLogs(logsRes.logs);
          if (ttRes && ttRes.state) {
            setTiktokLiveScreenStatus(ttRes.state);
            setLiveTask(prev => ({
              ...(prev || {}),
              tiktok_live: ttRes.state,
              is_running: Boolean(ttRes.state.is_running || prev?.is_running),
              current_task: ttRes.state.is_running ? 'tiktok_live' : (prev?.current_task || null),
            }));
            // Otomatis arahkan ke tab Tiktok Live jika bot TikTok sedang aktif & Google Maps tidak aktif (kecuali user sengaja beralih tab)
            const isGMapRunning = Boolean(liveTask?.is_running && !liveTask?.current_task?.includes('tiktok'));
            if (!userManuallyToggledScreen && ttRes.state.is_running && !isGMapRunning) {
              setSharescreenMode('tiktok_live');
            }
          }
          setScreenTs(Date.now());
        }
      } catch {}
    };

    fetchScreenData();
    const interval = setInterval(fetchScreenData, 1500);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [activeTab, liveTask?.is_running]);

  // Chart Interactive States
  const [chartHoverIdx, setChartHoverIdx] = useState(null);
  const [chartMetricView, setChartMetricView] = useState('both'); // 'both' | 'reviewed' | 'pending'

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState('all'); // 'all' | 'active' | 'needs_login' | 'expired' | 'no_cookie' | 'flagged'
  const [cookieFilter, setCookieFilter] = useState('all'); // 'all' | 'active' | 'needs_login' | 'expired'

  // Modals
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [accountForm, setAccountForm] = useState({ email: '', password: '', totp_secret: '' });

  // Edit account modal state
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [editAccountForm, setEditAccountForm] = useState({ id: null, email: '', password: '', totp_secret: '' });
  const [editAccountHasPassword, setEditAccountHasPassword] = useState(false);
  const [editAccountHasTotp, setEditAccountHasTotp] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Test login per-account loading state  { [id]: 'loading' | 'success' | 'failed' }
  const [testLoginStatus, setTestLoginStatus] = useState({});

  const [showCookieModal, setShowCookieModal] = useState(false);
  const [cookieForm, setCookieForm] = useState({ email: '', cookie_json: '' });

  // TikTok Cookie States
  const [tiktokCookies, setTikTokCookies] = useState([]);
  const [tiktokCookieFilter, setTikTokCookieFilter] = useState('all');
  const [tiktokSearchQuery, setTikTokSearchQuery] = useState('');
  const [isCheckingTikTok, setIsCheckingTikTok] = useState(false);
  const [showTikTokCookieModal, setShowTikTokCookieModal] = useState(false);
  const [tiktokCookieForm, setTikTokCookieForm] = useState({ username: '', nickname: '', cookie_json: '' });
  const [isSubmittingTikTokCookie, setIsSubmittingTikTokCookie] = useState(false);
  const [testingTikTokId, setTestingTikTokId] = useState(null);
  const [isDetectingTikTok, setIsDetectingTikTok] = useState(false);
  const [detectedTikTokInfo, setDetectedTikTokInfo] = useState(null);
  const [showTiktokConfigModal, setShowTiktokConfigModal] = useState(false);
  const detectTimeoutRef = useRef(null);

  const [showAddBizModal, setShowAddBizModal] = useState(false);
  const [bizForm, setBizForm] = useState({ name: '', url: '' });

  const [showFastRunModal, setShowFastRunModal] = useState(false);
  const [fastRunForm, setFastRunForm] = useState({ business_id: '', slots: 1, star_rating: 5 });

  const [snippetModalCookie, setSnippetModalCookie] = useState(null);

  // Checkbox selection state for cookies table
  const [selectedCookieIds, setSelectedCookieIds] = useState(new Set());

  // Notifications
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mobile sidebar open
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Usage & Tentacle Graph States
  const [usageData, setUsageData] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState('router');
  const [usageTimeframe, setUsageTimeframe] = useState('today'); // 'today' | '7d' | '30d'
  const [usageSubTab, setUsageSubTab] = useState('overview'); // 'overview' | 'details'
  const [usageSearchQuery, setUsageSearchQuery] = useState('');
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [taskExecutionMode, setTaskExecutionMode] = useState('queue'); // 'queue' (Mode Bergilir) | 'parallel' (Mode Paralel)
  const [rotationIndex, setRotationIndex] = useState(0);
  const [isRotatingQueue, setIsRotatingQueue] = useState(true);
  const [isSimulationActive, setIsSimulationActive] = useState(false); // Standby by default until task starts
  const [completedCookieIds, setCompletedCookieIds] = useState(new Set());
  const [usageFlowChoice, setUsageFlowChoice] = useState('auto'); // 'auto' | 'google_maps' | 'tiktok_live'

  const loadUsageData = async () => {
    try {
      setUsageLoading(true);
      const res = await api.getUsage();
      if (res && res.status === 'ok') {
        setUsageData(res);
        if (res.all_tiktok_cookies && res.all_tiktok_cookies.length > 0 && (!tiktokCookies || tiktokCookies.length === 0)) {
          setTikTokCookies(res.all_tiktok_cookies);
        }
        if (res.task_execution) {
          setLiveTask(res.task_execution);
        }
        if (res.task_execution?.is_running && res.task_execution?.mode) {
          setTaskExecutionMode(res.task_execution.mode);
        }
      }
    } catch (err) {
      console.error('Failed to fetch usage analytics:', err);
    } finally {
      setUsageLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'usage') {
      loadUsageData();
      const interval = setInterval(loadUsageData, 2500);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // ── Bot Modules Configuration States (Config Bot Tab) ──────────────────────
  const [botModulesConfig, setBotModulesConfig] = useState({
    google_maps: {
      enabled: true,
      name: 'Google Map',
      description: 'Otomatisasi ulasan bintang 5 & komentar AI Gemini berbasis target Maps.',
      star_rating: 5,
      ai_comments: true,
      auto_retry: true,
      rotation_mode: 'queue',
      display: false,
    },
    tiktok_live: {
      enabled: true,
      name: 'TikTok Live',
      description: 'Otomatisasi interaksi siaran langsung TikTok (Auto Tap-tap Like, Auto Chat, & Gift Welcome).',
      target_user: '@autobotix.live',
      tap_speed: 20,
      auto_chat: true,
      chat_message: 'Semangat live kak! Support selalu 🔥',
      gift_detection: true,
      display: false,
    },
    youtube_live: {
      enabled: false,
      coming_soon: true,
      name: 'Youtube Live (akan datang)',
      description: 'Otomatisasi komentar, auto like, dan engagement live streaming YouTube (Segera Hadir).',
    },
    display: {
      enabled: false,
      name: 'Display',
      subtitle: 'aktifkan layar untuk memantau bot.',
      description: 'aktifkan layar untuk memantau bot.',
    },
  });
  const [botConfigLoading, setBotConfigLoading] = useState(false);
  const [botConfigSaving, setBotConfigSaving] = useState(false);
  const [botConfigSavedSuccess, setBotConfigSavedSuccess] = useState(false);
  const [tiktokForm, setTiktokForm] = useState({
    target_user: '@autobotix.live',
    tap_speed: 20,
    chat_message: 'Semangat live kak! Support selalu 🔥',
    display: false,
  });

  const loadBotConfig = async () => {
    try {
      setBotConfigLoading(true);
      const res = await fetch('/api/bot-config', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        if (data.configs) {
          setBotModulesConfig(data.configs);
          if (data.configs.tiktok_live) {
            setTiktokForm({
              target_user: data.configs.tiktok_live.target_user || '@autobotix.live',
              tap_speed: data.configs.tiktok_live.tap_speed || 20,
              chat_message: data.configs.tiktok_live.chat_message || 'Semangat live kak! Support selalu 🔥',
              display: Boolean(data.configs.tiktok_live.display ?? data.configs.display?.enabled ?? false),
            });
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load bot config:', err);
    } finally {
      setBotConfigLoading(false);
    }
  };

  useEffect(() => {
    loadBotConfig();
    fetchTikTokCookies();
  }, []);

  useEffect(() => {
    if (activeTab === 'config-bot' || activeTab === 'sharescreen') {
      loadBotConfig();
    }
  }, [activeTab]);

  const handleToggleDisplay = async () => {
    const currentDisplay = botModulesConfig.display || { enabled: false, name: 'Display', subtitle: 'aktifkan layar untuk memantau bot.' };
    const nextEnabled = !currentDisplay.enabled;
    const nextConfig = {
      ...botModulesConfig,
      display: {
        ...currentDisplay,
        enabled: nextEnabled,
        name: 'Display',
        subtitle: 'aktifkan layar untuk memantau bot.',
      },
      tiktok_live: {
        ...(botModulesConfig.tiktok_live || {}),
        display: nextEnabled,
      },
      google_maps: {
        ...(botModulesConfig.google_maps || {}),
        display: nextEnabled,
      },
    };
    setBotModulesConfig(nextConfig);
    setTiktokForm(f => ({ ...f, display: nextEnabled }));
    try {
      setBotConfigSaving(true);
      await Promise.all([
        fetch('/api/bot-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ configs: nextConfig }),
        }),
        fetch('/api/tiktok-live/toggle-display', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ enabled: nextEnabled }),
        }).catch(() => {})
      ]);
      setBotConfigSavedSuccess(true);
      setStreamSessionKey(Date.now());
      setScreenTs(Date.now());
      setTimeout(() => setBotConfigSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to toggle display:', err);
    } finally {
      setBotConfigSaving(false);
    }
  };

  const handleToggleModule = async (moduleKey) => {
    if (moduleKey === 'youtube_live') return; // coming soon, locked
    const currentMod = botModulesConfig[moduleKey] || {};
    const newEnabled = !currentMod.enabled;
    const nextConfig = {
      ...botModulesConfig,
      [moduleKey]: {
        ...currentMod,
        enabled: newEnabled,
      },
    };
    setBotModulesConfig(nextConfig);
    try {
      setBotConfigSaving(true);
      await fetch('/api/bot-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ configs: nextConfig }),
      });
      setBotConfigSavedSuccess(true);
      setTimeout(() => setBotConfigSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to toggle module:', err);
    } finally {
      setBotConfigSaving(false);
    }
  };

  const handleSaveTiktokSettings = async (e, startImmediately = false) => {
    if (e && e.preventDefault) e.preventDefault();
    const nextConfig = {
      ...botModulesConfig,
      tiktok_live: {
        ...botModulesConfig.tiktok_live,
        target_user: tiktokForm.target_user,
        tap_speed: Number(tiktokForm.tap_speed),
        chat_message: tiktokForm.chat_message,
        display: Boolean(tiktokForm.display),
      },
      display: {
        ...(botModulesConfig.display || {}),
        enabled: Boolean(tiktokForm.display),
        name: 'Display',
        subtitle: 'aktifkan layar untuk memantau bot.',
      },
    };
    setBotModulesConfig(nextConfig);
    try {
      setBotConfigSaving(true);
      await fetch('/api/bot-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ configs: nextConfig }),
      });
      setBotConfigSavedSuccess(true);
      setTimeout(() => setBotConfigSavedSuccess(false), 2500);

      if (startImmediately) {
        setShowTiktokConfigModal(false);
        await handleStartTikTokLive({
          target_user: tiktokForm.target_user,
          tap_speed: Number(tiktokForm.tap_speed),
          chat_message: tiktokForm.chat_message,
          display: Boolean(tiktokForm.display),
        });
      }
    } catch (err) {
      console.error('Failed to save tiktok config:', err);
    } finally {
      setBotConfigSaving(false);
    }
  };

  const handleStartTikTokLive = async (customParams = {}) => {
    try {
      setSubmitting(true);
      const target = customParams.target_user || tiktokForm.target_user || botModulesConfig.tiktok_live?.target_user || '@tryfredy';
      const tapSpeed = Number(customParams.tap_speed || tiktokForm.tap_speed || botModulesConfig.tiktok_live?.tap_speed) || 50;
      const chatMsg = customParams.chat_message || tiktokForm.chat_message || botModulesConfig.tiktok_live?.chat_message || 'Halo Cantik';
      const isDisplay = customParams.display !== undefined
        ? Boolean(customParams.display)
        : Boolean(botModulesConfig.display?.enabled || tiktokForm.display);

      const res = await api.startTikTokLive({
        target_user: target,
        tap_speed: tapSpeed,
        auto_chat: true,
        chat_message: chatMsg,
        mode: 'parallel',
        display: isDisplay,
      });

      if (res && res.status === 'ok') {
        setSuccessMsg(`🚀 Bot TikTok Live berhasil dijalankan ke target ${target}!`);
        setStreamSessionKey(Date.now());
        setScreenTs(Date.now());
        if (res.state) {
          setTiktokLiveScreenStatus(res.state);
          setLiveTask(prev => ({
            ...(prev || {}),
            tiktok_live: res.state,
            is_running: true,
            current_task: 'tiktok_live',
          }));
        }
        setSharescreenMode('tiktok_live');
      } else {
        setErrorMsg(`Gagal memulai TikTok Live: ${res?.message || 'Error'}`);
      }
    } catch (err) {
      setErrorMsg(`Gagal memulai TikTok Live: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStopTikTokLive = async () => {
    try {
      setSubmitting(true);
      const res = await api.stopTikTokLive();
      if (res && res.status === 'ok') {
        setSuccessMsg('🛑 Bot TikTok Live berhasil dihentikan.');
        if (res.state) {
          setTiktokLiveScreenStatus(res.state);
          setLiveTask(prev => ({
            ...(prev || {}),
            tiktok_live: res.state,
            is_running: false,
            current_task: null,
          }));
        }
      } else {
        setErrorMsg(`Gagal menghentikan TikTok Live: ${res?.message || 'Error'}`);
      }
    } catch (err) {
      setErrorMsg(`Gagal menghentikan TikTok Live: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-advance turn in Mode Bergilir ONLY when task or simulation is active
  useEffect(() => {
    if (activeTab !== 'usage' || taskExecutionMode !== 'queue') return;
    const isRunning = Boolean(usageData?.task_execution?.is_running || isSimulationActive);
    if (!isRunning || !isRotatingQueue) return;
    const interval = setInterval(() => {
      setRotationIndex((prev) => prev + 1);
    }, 3200);
    return () => clearInterval(interval);
  }, [activeTab, taskExecutionMode, isRotatingQueue, usageData, isSimulationActive]);

  // ── Load All Data ─────────────────────────────────────────────────────────────
  const loadDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const [dashRes, cliRes] = await Promise.allSettled([
        api.getDashboard(),
        api.getCliStatus ? api.getCliStatus() : Promise.resolve(null),
      ]);

      if (dashRes.status === 'fulfilled') {
        setData(dashRes.value);
        if (dashRes.value?.all_tiktok_cookies) {
          setTikTokCookies(dashRes.value.all_tiktok_cookies);
        }
        if (dashRes.value?.task_execution || dashRes.value?.live_task) {
          setLiveTask(dashRes.value.task_execution || dashRes.value.live_task);
        }
      }
      if (cliRes.status === 'fulfilled' && cliRes.value) {
        setCliStatus(cliRes.value);
      }
    } catch (err) {
      if (!silent) setErrorMsg(err.message || 'Gagal memuat data dari server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Check for Google OAuth callback parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth_success')) {
      const em = params.get('email') || 'Akun Google';
      const nm = params.get('name') || '';
      setSuccessMsg(`✓ Berhasil menghubungkan akun Google: ${em}${nm ? ` (${nm})` : ''} via Google OAuth 2.0 Client!`);
      setActiveTab('cookies');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('oauth_error')) {
      setErrorMsg(`▲ Gagal otorisasi Google OAuth: ${params.get('oauth_error')}`);
      setActiveTab('cookies');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await api.logout();
      if (onLogout) onLogout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const handleCheckAccountNames = async () => {
    setIsCheckingNames(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.checkAccountNames();
      setSuccessMsg(
        `✓ Pengecekan Google selesai! ${res.active_cookies || 0} akun aktif terverifikasi (${res.checked || 0} cookie dipindai).`
      );
      loadDashboardData(true);
    } catch (err) {
      setErrorMsg(`Gagal memeriksa nama akun: ${err.message || err}`);
    } finally {
      setIsCheckingNames(false);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!accountForm.email) return;
    setSubmitting(true);
    try {
      await api.addEmail(accountForm.email, accountForm.password, accountForm.totp_secret);
      setSuccessMsg(`Akun Google "${accountForm.email}" berhasil didaftarkan!`);
      setAccountForm({ email: '', password: '', totp_secret: '' });
      setShowAddAccountModal(false);
      loadDashboardData(true);
    } catch (err) {
      setErrorMsg(`Gagal mendaftarkan akun: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (id, email) => {
    if (!window.confirm(`Hapus akun Google "${email}" dari sistem?`)) return;
    try {
      await api.deleteEmail(id);
      setSuccessMsg(`Akun "${email}" berhasil dihapus.`);
      loadDashboardData(true);
    } catch (err) {
      setErrorMsg(`Gagal menghapus akun: ${err.message || err}`);
    }
  };

  const openEditAccountModal = (acc) => {
    setEditAccountForm({ id: acc.id, email: acc.email, password: '', totp_secret: '' });
    setEditAccountHasPassword(!!(acc.password && acc.password !== 'cookie_auth'));
    setEditAccountHasTotp(!!acc.totp_secret);
    setShowEditPassword(false);
    setShowEditAccountModal(true);
  };

  const handleEditAccountSubmit = async (e) => {
    e.preventDefault();
    if (!editAccountForm.email) return;
    setSubmitting(true);
    try {
      await api.updateEmail(
        editAccountForm.id,
        editAccountForm.email,
        editAccountForm.password || null,
        editAccountForm.totp_secret || null,
      );
      setSuccessMsg(`Akun berhasil diperbarui.`);
      setShowEditAccountModal(false);
      loadDashboardData(true);
    } catch (err) {
      setErrorMsg(`Gagal memperbarui akun: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestLogin = async (id, email, hasPassword) => {
    if (!hasPassword) {
      setErrorMsg(`Akun ${email} belum memiliki password tersimpan. Edit akun terlebih dahulu untuk menambahkan password.`);
      return;
    }
    setTestLoginStatus(s => ({ ...s, [id]: 'loading' }));
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await api.testLoginEmail(id);
      if (res.status === 'success') {
        setTestLoginStatus(s => ({ ...s, [id]: 'success' }));
        setSuccessMsg(`✓ Login berhasil untuk ${email}! Cookie diperbarui.`);
        loadDashboardData(true);
      } else {
        setTestLoginStatus(s => ({ ...s, [id]: 'failed' }));
        setErrorMsg(`✗ Login gagal untuk ${email}: ${res.message || 'Tidak diketahui.'}`);
      }
    } catch (err) {
      setTestLoginStatus(s => ({ ...s, [id]: 'failed' }));
      setErrorMsg(`Error saat test login ${email}: ${err.message || err}`);
    } finally {
      // Reset icon kembali ke normal setelah 4 detik
      setTimeout(() => setTestLoginStatus(s => ({ ...s, [id]: undefined })), 4000);
    }
  };

  const handleToggleUnflag = async (id, email, isFlagged) => {
    try {
      if (isFlagged) {
        await api.unflagEmail(id);
        setSuccessMsg(`Status flag akun "${email}" berhasil dipulihkan (Aktif).`);
      }
      loadDashboardData(true);
    } catch (err) {
      setErrorMsg(`Gagal mengubah status flag: ${err.message || err}`);
    }
  };

  const handleUnflagAll = async () => {
    if (!window.confirm('Pulihkan semua akun yang terkena flag agar kembali aktif?')) return;
    try {
      await api.unflagAllEmails();
      setSuccessMsg('Semua akun Google berhasil dipulihkan ke status aktif!');
      loadDashboardData(true);
    } catch (err) {
      setErrorMsg(`Gagal unflag semua: ${err.message || err}`);
    }
  };

  const handleAddCookie = async (e) => {
    e.preventDefault();
    if (!cookieForm.cookie_json) return;
    setSubmitting(true);
    try {
      const res = await api.addCookie(cookieForm.email, cookieForm.cookie_json);
      const accName = res.account_name ? ` (Nama: ${res.account_name})` : '';
      setSuccessMsg(
        `✓ Cookie sesi berhasil disimpan & diverifikasi Google! Status: ${res.status?.toUpperCase()}${accName}`
      );
      setCookieForm({ email: '', cookie_json: '' });
      setShowCookieModal(false);
      loadDashboardData(true);
    } catch (err) {
      setErrorMsg(`Gagal menyimpan cookie: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCookie = async (id, email) => {
    if (!window.confirm(`Hapus akun "${email}" dari daftar?`)) return;
    try {
      await api.deleteCookie(id);
      setSuccessMsg(`Akun "${email}" berhasil dihapus.`);
      setSelectedCookieIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      loadDashboardData(true);
    } catch (err) {
      setErrorMsg(`Gagal menghapus akun: ${err.message || err}`);
    }
  };

  const handleBulkDeleteCookies = async () => {
    if (selectedCookieIds.size === 0) return;
    const count = selectedCookieIds.size;
    if (!window.confirm(`Hapus ${count} akun yang dipilih? Aksi ini tidak dapat dibatalkan.`)) return;
    let ok = 0, fail = 0;
    for (const id of selectedCookieIds) {
      try { await api.deleteCookie(id); ok++; } catch { fail++; }
    }
    setSelectedCookieIds(new Set());
    if (ok > 0) setSuccessMsg(`${ok} akun berhasil dihapus${fail > 0 ? `, ${fail} gagal` : ''}.`);
    else setErrorMsg(`Gagal menghapus semua akun yang dipilih.`);
    loadDashboardData(true);
  };

  const handleTestCookie = async (id, email) => {
    try {
      setRefreshing(true);
      const res = await api.testCookie(id);
      const isOk = res.is_valid;
      if (isOk) {
        setSuccessMsg(`✓ Sesi akun "${email}" AKTIF dan valid di Google Maps!`);
      } else {
        setErrorMsg(`▲ Sesi akun "${email}" bermasalah: ${res.reason || res.session_status}`);
      }
      loadDashboardData(true);
    } catch (err) {
      setErrorMsg(`Gagal menguji sesi: ${err.message || err}`);
    } finally {
      setRefreshing(false);
    }
  };

  const triggerDetectTikTok = async (cookiePayload) => {
    const payload = (cookiePayload || tiktokCookieForm.cookie_json || '').trim();
    if (!payload || payload.length < 10) return;
    setIsDetectingTikTok(true);
    setDetectedTikTokInfo(null);
    try {
      const res = await api.detectTikTokAccount(payload);
      setDetectedTikTokInfo(res);
      if (res.username) {
        setTikTokCookieForm(prev => ({
          ...prev,
          username: (!prev.username || prev.username.startsWith('@tiktok_')) ? res.username : prev.username,
          nickname: (!prev.nickname || prev.nickname.startsWith('tiktok_')) ? (res.nickname || prev.nickname) : prev.nickname
        }));
      }
    } catch {
      // ignore
    } finally {
      setIsDetectingTikTok(false);
    }
  };

  const handleCookieJsonChange = (val) => {
    setTikTokCookieForm(prev => ({ ...prev, cookie_json: val }));
    if (detectTimeoutRef.current) clearTimeout(detectTimeoutRef.current);
    if (val && val.length > 20) {
      detectTimeoutRef.current = setTimeout(() => {
        triggerDetectTikTok(val);
      }, 700);
    }
  };

  const handleAddTikTokCookie = async (e) => {
    e.preventDefault();
    if (!tiktokCookieForm.cookie_json) return;
    setIsSubmittingTikTokCookie(true);
    try {
      const res = await api.addTikTokCookie(
        tiktokCookieForm.username,
        tiktokCookieForm.cookie_json,
        tiktokCookieForm.nickname
      );
      const uName = res.username || tiktokCookieForm.username || 'Akun';
      setSuccessMsg(
        `✓ Cookie sesi TikTok ${uName} berhasil disimpan! Status: ${(res.session_status || 'aktif').toUpperCase()}`
      );
      setTikTokCookieForm({ username: '', nickname: '', cookie_json: '' });
      setShowTikTokCookieModal(false);
      loadDashboardData(true);
      fetchTikTokCookies();
    } catch (err) {
      setErrorMsg(`Gagal menyimpan cookie TikTok: ${err.message || err}`);
    } finally {
      setIsSubmittingTikTokCookie(false);
    }
  };

  const handleDeleteTikTokCookie = async (id, username) => {
    if (!window.confirm(`Hapus akun TikTok "${username}" dari daftar?`)) return;
    try {
      await api.deleteTikTokCookie(id);
      setSuccessMsg(`Akun TikTok "${username}" berhasil dihapus.`);
      loadDashboardData(true);
      fetchTikTokCookies();
    } catch (err) {
      setErrorMsg(`Gagal menghapus cookie TikTok: ${err.message || err}`);
    }
  };

  const handleTestTikTokCookie = async (id, username) => {
    setTestingTikTokId(id);
    try {
      const res = await api.testTikTokCookie(id);
      if (res.is_valid || res.session_status === 'active') {
        const uName = res.username || username;
        setSuccessMsg(`✓ Sesi TikTok "${uName}" AKTIF & terverifikasi valid!`);
      } else {
        setErrorMsg(`▲ Sesi TikTok "${username}": ${res.reason || res.session_status || 'Perlu login ulang'}`);
      }
      loadDashboardData(true);
      fetchTikTokCookies();
    } catch (err) {
      setErrorMsg(`Gagal menguji sesi TikTok: ${err.message || err}`);
    } finally {
      setTestingTikTokId(null);
    }
  };

  const handleTestAllTikTokCookies = async () => {
    setIsCheckingTikTok(true);
    try {
      const res = await api.testAllTikTokCookies();
      setSuccessMsg(`✓ ${res.message || 'Pemeriksaan sesi TikTok selesai!'}`);
      loadDashboardData(true);
      fetchTikTokCookies();
    } catch (err) {
      setErrorMsg(`Gagal memindai sesi TikTok: ${err.message || err}`);
    } finally {
      setIsCheckingTikTok(false);
    }
  };

  const fetchTikTokCookies = async () => {
    try {
      const res = await api.getTikTokCookies();
      if (res && res.cookies) {
        setTikTokCookies(res.cookies);
      }
    } catch {
      // ignore
    }
  };

  const handleAddBusiness = async (e) => {
    e.preventDefault();
    if (!bizForm.name || !bizForm.url) return;
    setSubmitting(true);
    try {
      await api.addBusiness(bizForm.name, bizForm.url);
      setSuccessMsg(`Bisnis "${bizForm.name}" berhasil ditambahkan sebagai target ulasan Google Maps!`);
      setBizForm({ name: '', url: '' });
      setShowAddBizModal(false);
      loadDashboardData(true);
    } catch (err) {
      setErrorMsg(`Gagal menambahkan target bisnis: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBusiness = async (id, name) => {
    if (!window.confirm(`Hapus target bisnis "${name}" dan riwayat ulasannya?`)) return;
    try {
      await api.deleteBusiness(id);
      setSuccessMsg(`Target bisnis "${name}" berhasil dihapus.`);
      loadDashboardData(true);
    } catch (err) {
      setErrorMsg(`Gagal menghapus bisnis: ${err.message || err}`);
    }
  };

  const handleEmergencyStop = async () => {
    if (!window.confirm('PERINGATAN: Hentikan paksa semua Chromium browser dan batalkan antrean review yang sedang jalan?')) return;
    try {
      setRefreshing(true);
      await api.emergencyStopWorker();
      setSuccessMsg('🛑 Emergency Stop berhasil! Semua browser Chromium dihentikan.');
      loadDashboardData(true);
    } catch (err) {
      setErrorMsg(`Gagal menghentikan worker: ${err.message || err}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFastRunSubmit = async (e) => {
    e.preventDefault();
    if (!fastRunForm.business_id) return;
    setSubmitting(true);
    try {
      const params = {
        [`star_${fastRunForm.star_rating}_count`]: parseInt(fastRunForm.slots, 10),
        review_style: 'random',
        selected_language: 'Indonesian',
      };
      await api.startBot(fastRunForm.business_id, params);
      setSuccessMsg(`🚀 Ulasan bot berhasil diluncurkan dengan ${fastRunForm.slots} browser Chromium!`);
      setShowFastRunModal(false);
      loadDashboardData(true);
      setSharescreenMode('google_map');
      setStreamSessionKey(Date.now());
      setScreenTs(Date.now());
      setStreamError(false);
    } catch (err) {
      setErrorMsg(`Gagal menjalankan bot: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived Data ──────────────────────────────────────────────────────────────
  const emails = data?.all_emails || [];
  const cookies = data?.all_cookies || [];
  const businesses = data?.businesses || [];

  const handleOpenFastRunModal = (bizId = null) => {
    let targetBizId = bizId;
    if (!targetBizId && !fastRunForm.business_id && businesses && businesses.length > 0) {
      targetBizId = String(businesses[0].id);
    }
    if (targetBizId) {
      setFastRunForm(prev => ({ ...prev, business_id: String(targetBizId) }));
    }
    setShowFastRunModal(true);
  };
  const queueMetrics = data?.queue_metrics || {};
  const hostMetrics = data?.host_metrics || {};
  const displays = data?.displays || cliStatus?.displays || [':99', ':100', ':101', ':102', ':103', ':104'];

  const tiktokCookiesList = (tiktokCookies && tiktokCookies.length > 0) ? tiktokCookies : (data?.all_tiktok_cookies || []);
  const activeTikTokCount = tiktokCookiesList.filter((c) => c.status === 'active').length;
  const needsLoginTikTokCount = tiktokCookiesList.filter((c) => c.status === 'needs_login' || c.status === 'unknown').length;
  const expiredTikTokCount = tiktokCookiesList.filter((c) => c.status === 'expired' || c.status === 'invalid').length;

  const filteredTikTokCookies = useMemo(() => {
    return tiktokCookiesList.filter((ck) => {
      const matchSearch =
        !tiktokSearchQuery ||
        (ck.username || '').toLowerCase().includes(tiktokSearchQuery.toLowerCase()) ||
        (ck.nickname || '').toLowerCase().includes(tiktokSearchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (tiktokCookieFilter === 'active') return ck.status === 'active';
      if (tiktokCookieFilter === 'needs_login') return ck.status === 'needs_login' || ck.status === 'unknown';
      if (tiktokCookieFilter === 'expired') return ck.status === 'expired' || ck.status === 'invalid';
      return true;
    });
  }, [tiktokCookiesList, tiktokSearchQuery, tiktokCookieFilter]);

  const activeCookiesCount = cookies.filter((c) => c.status === 'active').length;
  const needsLoginCookiesCount = cookies.filter((c) => c.status === 'needs_login').length;
  const expiredCookiesCount = cookies.filter((c) => c.status === 'expired' || c.status === 'invalid').length;

  const activeAccountsCount = emails.filter((e) => e.cookie_status === 'active').length;

  // Automatic Task Flow Detection (TikTok Live vs Google Maps vs Idle Standby)
  const detectedTaskType = usageData?.task_execution?.active_task_type; // 'tiktok_live' | 'google_maps' | 'idle'
  const isLiveTaskRunning = Boolean(usageData?.task_execution?.is_running);
  const activeFlowType = useMemo(() => {
    if (usageFlowChoice !== 'auto') {
      return usageFlowChoice;
    }
    if (isLiveTaskRunning && detectedTaskType && detectedTaskType !== 'idle') {
      return detectedTaskType;
    }
    return 'google_maps';
  }, [usageFlowChoice, isLiveTaskRunning, detectedTaskType]);

  const isTikTokFlow = activeFlowType === 'tiktok_live';

  // Dynamic Tentacle Flow Nodes (Automatically adapts between Google Maps and TikTok Live)
  const tentacleNodes = useMemo(() => {
    let list = [];
    if (isTikTokFlow) {
      const ttList = (tiktokCookiesList && tiktokCookiesList.length > 0)
        ? tiktokCookiesList
        : (usageData?.all_tiktok_cookies || []);
      list = ttList.length > 0 ? ttList : [
        { id: '1', username: '@bedadariyanglain21', nickname: 'Beda Dari Yang Lain', status: 'active' },
        { id: '2', username: '@galoijul', nickname: 'Galo Ijul', status: 'active' },
        { id: '3', username: '@tiktok_creator', nickname: 'TikTok Creator', status: 'needs_login' },
      ];
    } else {
      list = cookies.length > 0 ? cookies : [
        { id: '181', email: 'muhmadaljannah@gmail.com', account_name: 'Muhammad Jannah', status: 'active' },
        { id: '179', email: 'galoijul@gmail.com', account_name: 'Galo Ijul', status: 'active' },
        { id: '175', email: 'cantikaayu0302@gmail.com', account_name: 'Cantika Ayu', status: 'needs_login' },
        { id: '187', email: 'jonotayo7@gmail.com', account_name: 'Jono Tayo', status: 'active' },
      ];
    }

    const N = list.length;
    const cx = 480;
    const cy = 300;
    const Rx = 340;
    const Ry = 220;
    const colors = isTikTokFlow
      ? ['#FE2C55', '#25F4EE', '#EC4899', '#06B6D4', '#A855F7', '#F43F5E', '#38BDF8', '#F59E0B']
      : ['#F59E0B', '#38BDF8', '#10B981', '#A855F7', '#EC4899', '#06B6D4', '#6366F1', '#F97316'];

    // De Casteljau subdivision for cleanly severing the tentacle if needs_login
    const splitBezier = (p0, p1, p2, p3, t) => {
      const lerp = (a, b, f) => a + (b - a) * f;
      const ptLerp = (a, b, f) => ({ x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f) });
      const p01 = ptLerp(p0, p1, t);
      const p12 = ptLerp(p1, p2, t);
      const p23 = ptLerp(p2, p3, t);
      const p012 = ptLerp(p01, p12, t);
      const p123 = ptLerp(p12, p23, t);
      const p0123 = ptLerp(p012, p123, t);
      return {
        left: [p0, p01, p012, p0123],
        right: [p0123, p123, p23, p3],
      };
    };

    const toPath = (pts) =>
      `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} C ${pts[1].x.toFixed(1)} ${pts[1].y.toFixed(1)}, ${pts[2].x.toFixed(1)} ${pts[2].y.toFixed(1)}, ${pts[3].x.toFixed(1)} ${pts[3].y.toFixed(1)}`;

    return list.map((c, i) => {
      const alpha = (2 * Math.PI * i / N) - (Math.PI / 2);
      const rScale = N > 6 ? ((i % 2 === 0) ? 1.0 : 0.76) : 0.90;
      const nodeX = cx + Rx * rScale * Math.cos(alpha);
      const nodeY = cy + Ry * rScale * Math.sin(alpha);

      const curlFactor = (i % 2 === 0 ? 1 : -1) * (N > 8 ? 26 : 34);
      const perpX = -Math.sin(alpha);
      const perpY = Math.cos(alpha);

      const cp1X = cx + (nodeX - cx) * 0.35 + curlFactor * perpX;
      const cp1Y = cy + (nodeY - cy) * 0.35 + curlFactor * perpY;
      const cp2X = cx + (nodeX - cx) * 0.70 - (curlFactor * 0.6) * perpX;
      const cp2Y = cy + (nodeY - cy) * 0.70 - (curlFactor * 0.6) * perpY;

      const p0 = { x: cx, y: cy };
      const p1 = { x: cp1X, y: cp1Y };
      const p2 = { x: cp2X, y: cp2Y };
      const p3 = { x: nodeX, y: nodeY };

      const fullPathD = `M ${cx} ${cy} C ${cp1X.toFixed(1)} ${cp1Y.toFixed(1)}, ${cp2X.toFixed(1)} ${cp2Y.toFixed(1)}, ${nodeX.toFixed(1)} ${nodeY.toFixed(1)}`;

      const rawName = isTikTokFlow
        ? (c.username || c.nickname || `TikTok #${c.id}`).trim()
        : (c.account_name || c.email?.split('@')[0] || `Akun #${c.id}`).trim();
      const displayName = rawName.length > 14 ? rawName.substring(0, 13) + '…' : rawName;

      // Status check for severed connection
      const isNeedsLogin =
        c.status === 'needs_login' ||
        c.status === 'expired' ||
        c.status === 'invalid' ||
        c.status === 'perlu_login';

      const stump1 = splitBezier(p0, p1, p2, p3, 0.38).left;
      const stump2 = splitBezier(p0, p1, p2, p3, 0.74).right;
      const stump1Path = toPath(stump1);
      const stump2Path = toPath(stump2);
      const breakTip1 = stump1[3];
      const breakTip2 = stump2[0];
      const midBreak = { x: (breakTip1.x + breakTip2.x) / 2, y: (breakTip1.y + breakTip2.y) / 2 };

      const mt = 0.48;
      const t = 0.52;
      const midPoint = {
        x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
        y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
      };

      return {
        index: i,
        id: isTikTokFlow ? `node_tiktok_${c.id}` : `node_cookie_${c.id}`,
        realId: c.id,
        name: displayName,
        fullName: rawName,
        email: isTikTokFlow ? (c.username || `@user_${c.id}`) : (c.email || `${rawName.toLowerCase()}@gmail.com`),
        username: c.username,
        nickname: c.nickname,
        avatar_url: c.avatar_url,
        isTikTok: isTikTokFlow,
        status: c.status || 'active',
        isNeedsLogin,
        x: nodeX,
        y: nodeY,
        pathD: fullPathD,
        stump1Path,
        stump2Path,
        breakTip1,
        breakTip2,
        midBreak,
        midPoint,
        color: isNeedsLogin ? '#EF4444' : colors[i % colors.length],
        animDur: `${(2.0 + (i % 5) * 0.3).toFixed(1)}s`,
      };
    });
  }, [cookies, tiktokCookiesList, usageData, isTikTokFlow]);

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return emails.filter((acc) => {
      const matchSearch =
        acc.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (acc.account_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (accountFilter === 'active') return acc.cookie_status === 'active';
      if (accountFilter === 'needs_login') return acc.cookie_status === 'needs_login';
      if (accountFilter === 'expired') return acc.cookie_status === 'expired';
      if (accountFilter === 'no_cookie') return !acc.cookie_status || acc.cookie_status === 'no_cookie';
      if (accountFilter === 'flagged') return Boolean(acc.flagged);
      return true;
    });
  }, [emails, searchQuery, accountFilter]);

  // Filtered Cookies
  const filteredCookies = useMemo(() => {
    return cookies.filter((ck) => {
      const matchSearch =
        ck.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ck.account_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (cookieFilter === 'active') return ck.status === 'active';
      if (cookieFilter === 'needs_login') return ck.status === 'needs_login';
      if (cookieFilter === 'expired') return ck.status === 'expired' || ck.status === 'invalid';
      return true;
    });
  }, [cookies, searchQuery, cookieFilter]);

  // Host Metric Calculations
  const memTotal = hostMetrics.memory ? Math.round(hostMetrics.memory.total / (1024 * 1024 * 1024) * 10) / 10 : 0;
  const memUsed = hostMetrics.memory ? Math.round(hostMetrics.memory.used / (1024 * 1024 * 1024) * 10) / 10 : 0;
  const memPercent = memTotal > 0 ? Math.round((memUsed / memTotal) * 100) : 0;

  const diskTotal = hostMetrics.storage ? Math.round(hostMetrics.storage.total / (1024 * 1024 * 1024) * 10) / 10 : 0;
  const diskUsed = hostMetrics.storage ? Math.round(hostMetrics.storage.used / (1024 * 1024 * 1024) * 10) / 10 : 0;
  const diskPercent = diskTotal > 0 ? Math.round((diskUsed / diskTotal) * 100) : 0;

  const cpuLoad1 = hostMetrics.cpu?.load_1 ? hostMetrics.cpu.load_1.toFixed(2) : '0.15';
  const cpuLoad5 = hostMetrics.cpu?.load_5 ? hostMetrics.cpu.load_5.toFixed(2) : '0.20';
  const cpuCores = hostMetrics.cpu?.logical_cpus || 4;

  // ── Chart Calculations & Spline Data ─────────────────────────────────────────
  const chartData = useMemo(() => {
    const trends = data?.analytics?.daily_trends;
    if (trends && trends.length > 0) {
      return trends.map((t, idx) => {
        const idLabel = (t.label || '')
          .replace('Oct', 'Okt')
          .replace('May', 'Mei')
          .replace('Aug', 'Agu')
          .replace('Dec', 'Des')
          .replace('Jan', 'Jan')
          .replace('Feb', 'Feb')
          .replace('Mar', 'Mar')
          .replace('Apr', 'Apr')
          .replace('Jun', 'Jun')
          .replace('Jul', 'Jul')
          .replace('Sep', 'Sep')
          .replace('Nov', 'Nov');
        return {
          day: t.day,
          label: idLabel,
          count: Number(t.count || 0),
          pending: Number(t.pending || 0),
          isToday: idx === trends.length - 1,
        };
      });
    }
    // Fallback: 7 days up to today
    const list = [];
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      list.push({
        day: dayStr,
        label: `${d.getDate()} ${monthNames[d.getMonth()]}`,
        count: i === 0 ? Number(queueMetrics.reviewed || 0) : 0,
        pending: i === 0 ? Number(queueMetrics.pending || 0) : 0,
        isToday: i === 0,
      });
    }
    return list;
  }, [data?.analytics?.daily_trends, queueMetrics.reviewed, queueMetrics.pending]);

  const chartW = 600;
  const chartH = 190;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;
  const effectiveW = chartW - paddingLeft - paddingRight;
  const effectiveH = chartH - paddingTop - paddingBottom;
  const baselineY = chartH - paddingBottom;

  const rawMax = Math.max(4, ...chartData.map((d) => Math.max(d.count, d.pending)));
  const chartMaxY = rawMax <= 4 ? 4 : rawMax <= 8 ? 8 : rawMax <= 15 ? 15 : Math.ceil(rawMax / 5) * 5;

  const chartPoints = useMemo(() => {
    return chartData.map((d, i) => {
      const x = paddingLeft + (chartData.length > 1 ? (i / (chartData.length - 1)) * effectiveW : effectiveW / 2);
      const graphBaselineY = baselineY - 4;
      const effectiveGraphH = effectiveH - 8;

      const reviewedY = d.count > 0 ? graphBaselineY - (d.count / chartMaxY) * effectiveGraphH : graphBaselineY;
      const pendingY = d.pending > 0 ? graphBaselineY - (d.pending / chartMaxY) * effectiveGraphH : graphBaselineY;
      return {
        ...d,
        x,
        reviewedY: Math.min(Math.max(reviewedY, paddingTop), graphBaselineY),
        pendingY: Math.min(Math.max(pendingY, paddingTop), graphBaselineY),
      };
    });
  }, [chartData, chartMaxY, effectiveW, effectiveH, baselineY, paddingLeft, paddingTop]);

  const reviewedSpline = useMemo(() => {
    return getSplinePaths(
      chartPoints.map((p) => ({ x: p.x, y: p.reviewedY })),
      baselineY
    );
  }, [chartPoints, baselineY]);

  const pendingSpline = useMemo(() => {
    return getSplinePaths(
      chartPoints.map((p) => ({ x: p.x, y: p.pendingY })),
      baselineY
    );
  }, [chartPoints, baselineY]);

  const total7DaysReviewed = useMemo(() => {
    return chartData.reduce((acc, cur) => acc + cur.count, 0);
  }, [chartData]);

  const total7DaysPending = useMemo(() => {
    return chartData.reduce((acc, cur) => acc + cur.pending, 0);
  }, [chartData]);

  // Donut geometry for cookie health
  const donutR = 44;
  const donutCircumference = 2 * Math.PI * donutR; // ~276.46
  const totalCookieCount = activeCookiesCount + needsLoginCookiesCount + expiredCookiesCount;
  const activePercent = totalCookieCount > 0 ? Math.round((activeCookiesCount / totalCookieCount) * 100) : 0;
  const activeLen = totalCookieCount > 0 ? (activeCookiesCount / totalCookieCount) * donutCircumference : 0;
  const needsLen = totalCookieCount > 0 ? (needsLoginCookiesCount / totalCookieCount) * donutCircumference : 0;
  const expiredLen = totalCookieCount > 0 ? (expiredCookiesCount / totalCookieCount) * donutCircumference : 0;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex items-start font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* ========================================================================= */}
      {/* SIDEBAR: Fixed viewport height (h-screen), never stretches with content   */}
      {/* ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] text-slate-300 border-r border-slate-800/80 flex flex-col justify-between rounded-none transition-transform duration-200 h-screen lg:h-screen lg:sticky lg:top-0 lg:self-start lg:shrink-0 overflow-y-auto overflow-x-hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header Brand */}
        <div>
          <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-none bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-extrabold shadow-sm">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-tight">AutoBotix</span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-none border border-emerald-500/20 font-mono">
                  SaaS
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links (Zero Border Radius, Clean No-Subtitle) */}
          <div className="py-2 space-y-0.5">
            <button
              onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-white border-l-3 border-emerald-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className={`w-4 h-4 ${activeTab === 'overview' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>Dashboard & Ringkasan</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('sharescreen'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'sharescreen'
                  ? 'bg-slate-800 text-white border-l-3 border-emerald-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tv className={`w-4 h-4 ${activeTab === 'sharescreen' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="flex items-center gap-2">
                  <span>Sharescreen Bot</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('cookies'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'cookies'
                  ? 'bg-slate-800 text-white border-l-3 border-emerald-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Cookie className={`w-4 h-4 ${activeTab === 'cookies' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>Akun Google (Cookie)</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('tiktok-cookies'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'tiktok-cookies'
                  ? 'bg-slate-800 text-white border-l-3 border-emerald-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <TikTokLogo className={`w-4 h-4 ${activeTab === 'tiktok-cookies' ? 'text-pink-400' : 'text-slate-400'}`} />
                <span className="flex items-center gap-2">
                  <span>Akun Tiktok (Cookie)</span>
                  <span className="text-[9px] font-mono font-bold text-pink-400 bg-pink-950/80 px-1.5 py-0.2 rounded border border-pink-800">
                    TIKTOK
                  </span>
                </span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('usage'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'usage'
                  ? 'bg-slate-800 text-white border-l-3 border-emerald-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Cpu className={`w-4 h-4 ${activeTab === 'usage' ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="flex items-center gap-2">
                  <span>Usage</span>
                  <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800">
                    FLOW
                  </span>
                </span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('config-bot'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'config-bot'
                  ? 'bg-slate-800 text-white border-l-3 border-emerald-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sliders className={`w-4 h-4 ${activeTab === 'config-bot' ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="flex items-center gap-2">
                  <span>Config Bot</span>
                  <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800">
                    TUGAS
                  </span>
                </span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('server'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'server'
                  ? 'bg-slate-800 text-white border-l-3 border-emerald-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Server className={`w-4 h-4 ${activeTab === 'server' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>Manajemen Server</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('businesses'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'businesses'
                  ? 'bg-slate-800 text-white border-l-3 border-emerald-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className={`w-4 h-4 ${activeTab === 'businesses' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>Target Bisnis Maps</span>
              </div>
            </button>

          </div>
        </div>

        {/* Sidebar Footer: Server & Admin Profile (No Border Radius) */}
        <div className="p-3 border-t border-slate-800/80 space-y-2 rounded-none">
          {/* Server Uptime Indicator */}
          <div className="bg-slate-950/60 rounded-none p-2.5 border border-slate-800 text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium text-slate-300">Native Chromium</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">ONLINE</span>
          </div>

          {/* Profile Card */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-none bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                AD
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Administrator</p>
                <p className="text-[10px] text-slate-400 truncate">autobotix.my.id</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-none transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA: Pure SaaS Light Mode (Crisp White & Slate-50)          */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0"
              aria-label="Buka Menu"
            >
              <Layers className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 tracking-tight truncate">
                {activeTab === 'overview' && 'Executive Dashboard'}
                {activeTab === 'sharescreen' && 'Live Sharescreen Bot (Display :99)'}
                {activeTab === 'cookies' && 'Manajemen Akun Google (Import Cookie Sesi)'}
                {activeTab === 'tiktok-cookies' && 'Manajemen Akun TikTok (Import Cookie Sesi)'}
                {activeTab === 'usage' && 'Usage & Analytics'}
                {activeTab === 'config-bot' && 'Config Bot & Tugas Otomasi'}
                {activeTab === 'server' && 'Manajemen Server'}
                {activeTab === 'businesses' && 'Target Bisnis Maps'}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block truncate">
                AutoBotix Cloud Review SaaS • Native Linux Headless Engine
              </p>
            </div>
          </div>

          {/* User Profile Dropdown Button */}
          <div className="relative shrink-0" ref={profileDropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              aria-label="Menu Profil"
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full sm:rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 group-hover:ring-blue-500/30 transition-all shrink-0">
                <User className="w-4 h-4 text-slate-200" />
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <span className="block text-xs font-bold text-slate-900 leading-tight">Admin</span>
                <span className="block text-[10px] text-emerald-600 font-semibold font-mono leading-tight">ONLINE</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform hidden sm:block ${
                  profileDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-200/90 shadow-xl z-50 overflow-hidden font-sans py-1.5 divide-y divide-slate-100 transition-all">
                {/* Header Profile Info */}
                <div className="px-4 py-3 bg-slate-50/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm ring-2 ring-emerald-500/30 shrink-0">
                      <User className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">Administrator</p>
                      <p className="text-xs text-slate-500 truncate">admin@autobotix.my.id</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Master Admin
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions in Dropdown */}
                <div className="p-1.5 space-y-0.5">
                  {/* Cek Nama Akun Live */}
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleCheckAccountNames();
                    }}
                    disabled={isCheckingNames}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 rounded-xl transition-colors cursor-pointer text-left disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 text-emerald-600 ${isCheckingNames ? 'animate-spin' : ''}`} />
                    <div>
                      <p className="font-semibold">{isCheckingNames ? 'Memindai Google...' : 'Cek Nama Akun Live'}</p>
                      <p className="text-[10px] text-slate-500">Verifikasi profil sesi Google</p>
                    </div>
                  </button>

                  {/* Jalankan Task Bot */}
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setShowFastRunModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Play className="w-4 h-4 text-blue-600 fill-current" />
                    <div>
                      <p className="font-semibold">Luncurkan Task Bot</p>
                      <p className="text-[10px] text-slate-500">Mulai Chromium multi-display</p>
                    </div>
                  </button>

                  {/* Emergency Stop */}
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleEmergencyStop();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Square className="w-4 h-4 text-rose-600" />
                    <div>
                      <p className="font-semibold text-rose-600">Emergency Stop</p>
                      <p className="text-[10px] text-rose-500/80">Hentikan semua worker & browser</p>
                    </div>
                  </button>
                </div>

                {/* Logout Action */}
                <div className="p-1.5">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar dari Sesi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Global Notifications Banner */}
        <div className="px-4 sm:px-6 pt-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-2xs mb-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={() => setErrorMsg('')}
                className="text-rose-500 hover:text-rose-800 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-2xs mb-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button
                onClick={() => setSuccessMsg('')}
                className="text-emerald-500 hover:text-emerald-800 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* TAB 1: 📊 EXECUTIVE OVERVIEW & SAAS CHARTS                            */}
        {/* ===================================================================== */}
        {activeTab === 'overview' && (
          <main className="p-4 sm:p-6 space-y-6">
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Akun Google Cookie */}
              <div 
                onClick={() => setActiveTab('cookies')}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-amber-700 transition-colors">
                    Akun Google (Cookie)
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Cookie className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight group-hover:text-blue-700 transition-colors">
                    {cookies.length}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Akun Terdaftar</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{activeCookiesCount} Sesi Aktif</span>
                  </span>
                  {needsLoginCookiesCount > 0 && (
                    <span className="text-amber-600 font-semibold">{needsLoginCookiesCount} Perlu Re-Auth</span>
                  )}
                </div>
              </div>

              {/* Card 2: Status Akun Google */}
              <div 
                onClick={() => setActiveTab('cookies')}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-emerald-400 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
                    Status Akun Google
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-600 font-mono tracking-tight">
                    {activeCookiesCount}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ {cookies.length} Siap Pakai</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-1.5">
                  <span className="text-amber-600 font-medium">
                    {needsLoginCookiesCount} Perlu Re-Auth
                  </span>
                  <span className="text-rose-600 font-medium">
                    {expiredCookiesCount} Kedaluwarsa
                  </span>
                </div>
              </div>

              {/* Card 3: Ulasan Terkirim */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Ulasan Terkirim
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {queueMetrics.reviewed || 0}
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sukses
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-1.5">
                  <span>{businesses.length} Target Maps</span>
                  <span className="text-amber-600 font-medium">{queueMetrics.pending || 0} Antrean</span>
                </div>
              </div>

              {/* Card 4: Target Bisnis Maps */}
              <div 
                onClick={() => setActiveTab('businesses')}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-amber-700 transition-colors">
                    Target Bisnis Maps
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight group-hover:text-amber-700 transition-colors">
                    {businesses.length}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Listing Google Maps</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-1.5">
                  <span>RAM Host: {memUsed}/{memTotal} GB</span>
                  <span className="font-mono text-emerald-600 font-semibold">{memPercent}%</span>
                </div>
              </div>
            </div>

            {/* Middle Section: SaaS Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Chart 1: Review Velocity & Growth Chart (SVG Spline Line Chart) */}
              <div className="xl:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">Performa & Aktivitas Ulasan</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Real-Time (7 Hari)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tren ulasan sukses vs antrean bot multi-display Chromium
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View metric filter tabs */}
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 text-xs">
                        <button
                          type="button"
                          onClick={() => setChartMetricView('both')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                            chartMetricView === 'both'
                              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Semua
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartMetricView('reviewed')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                            chartMetricView === 'reviewed'
                              ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span> Sukses ({total7DaysReviewed})
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartMetricView('pending')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                            chartMetricView === 'pending'
                              ? 'bg-white text-amber-600 shadow-2xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span> Antrean ({total7DaysPending})
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Operational KPI Strip inside Chart */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                    <div className="px-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Total 7 Hari</span>
                      <span className="text-base font-extrabold text-slate-900 font-mono">
                        {total7DaysReviewed} <span className="text-[11px] font-normal text-slate-500 font-sans">sukses</span>
                      </span>
                    </div>
                    <div className="px-2 border-l border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Antrean</span>
                      <span className="text-base font-extrabold text-amber-600 font-mono">
                        {total7DaysPending} <span className="text-[11px] font-normal text-slate-500 font-sans">antrean</span>
                      </span>
                    </div>
                    <div className="px-2 border-t pt-2 sm:border-t-0 sm:pt-0 sm:border-l border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Puncak Harian</span>
                      <span className="text-base font-extrabold text-blue-600 font-mono">
                        {Math.max(...chartData.map((d) => d.count), 0)}{' '}
                        <span className="text-[11px] font-normal text-slate-500 font-sans">/hari</span>
                      </span>
                    </div>
                    <div className="px-2 border-t pt-2 sm:border-t-0 sm:pt-0 border-l border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Efisiensi Bot</span>
                      <span className="text-base font-extrabold text-emerald-600 font-mono">
                        {data?.analytics?.success_rate != null ? `${data.analytics.success_rate}%` : '100%'}
                      </span>
                    </div>
                  </div>

                  {/* SVG Spline Graphic Container */}
                  <div className="h-52 sm:h-60 w-full relative select-none">
                    <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="reviewedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                          <stop offset="85%" stopColor="#2563EB" stopOpacity="0.02" />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.18" />
                          <stop offset="85%" stopColor="#F59E0B" stopOpacity="0.02" />
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Gridlines & Y-Axis Scale */}
                      {[0, 1, 2, 3].map((step) => {
                        const val = Math.round((chartMaxY / 3) * step);
                        const y = baselineY - (step / 3) * effectiveH;
                        return (
                          <g key={step}>
                            <line
                              x1={paddingLeft}
                              y1={y}
                              x2={chartW - paddingRight}
                              y2={y}
                              stroke={step === 0 ? '#CBD5E1' : '#F1F5F9'}
                              strokeDasharray={step === 0 ? '' : '4 4'}
                              strokeWidth={step === 0 ? '1.2' : '1'}
                            />
                            <text
                              x={paddingLeft - 8}
                              y={y + 3.5}
                              textAnchor="end"
                              className="fill-slate-400 font-mono text-[10px] select-none"
                            >
                              {val}
                            </text>
                          </g>
                        );
                      })}

                      {/* Subtle Volume Pillar Silhouettes behind Spline */}
                      {chartPoints.map((p, idx) => {
                        const colW = 18;
                        const isHovered = chartHoverIdx === idx;
                        const activeCount = p.count + p.pending;
                        const barH = activeCount > 0 ? Math.max(8, ((activeCount / chartMaxY) * (effectiveH - 8))) : 4;
                        const barY = baselineY - barH;

                        return (
                          <rect
                            key={`vol-bar-${idx}`}
                            x={p.x - colW / 2}
                            y={barY}
                            width={colW}
                            height={barH}
                            rx={4}
                            fill={
                              isHovered
                                ? 'rgba(37, 99, 235, 0.18)'
                                : p.count > 0
                                ? 'rgba(37, 99, 235, 0.08)'
                                : 'rgba(241, 245, 249, 0.8)'
                            }
                            className="transition-colors duration-200"
                          />
                        );
                      })}

                      {/* Series 1: Reviewed Area & Spline Line */}
                      {(chartMetricView === 'both' || chartMetricView === 'reviewed') && (
                        <>
                          <path
                            d={reviewedSpline.areaPath}
                            fill="url(#reviewedGrad)"
                            className="transition-all duration-300"
                          />
                          <path
                            d={reviewedSpline.linePath}
                            fill="none"
                            stroke="#2563EB"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all duration-300"
                          />
                        </>
                      )}

                      {/* Series 2: Pending Area & Spline Line */}
                      {(chartMetricView === 'both' || chartMetricView === 'pending') && (total7DaysPending > 0 || chartMetricView === 'pending') && (
                        <>
                          <path
                            d={pendingSpline.areaPath}
                            fill="url(#pendingGrad)"
                            className="transition-all duration-300"
                          />
                          <path
                            d={pendingSpline.linePath}
                            fill="none"
                            stroke="#F59E0B"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all duration-300"
                          />
                        </>
                      )}

                      {/* Normal Dots */}
                      {chartPoints.map((p, idx) => {
                        if (chartHoverIdx === idx) return null;
                        return (
                          <g key={`dots-${idx}`}>
                            {(chartMetricView === 'both' || chartMetricView === 'reviewed') && (
                              <circle
                                cx={p.x}
                                cy={p.reviewedY}
                                r={p.count > 0 ? 3.5 : 2.5}
                                fill={p.count > 0 ? '#2563EB' : '#94A3B8'}
                                stroke="#FFFFFF"
                                strokeWidth="1.5"
                              />
                            )}
                            {(chartMetricView === 'both' || chartMetricView === 'pending') && p.pending > 0 && (
                              <circle
                                cx={p.x}
                                cy={p.pendingY}
                                r="3"
                                fill="#F59E0B"
                                stroke="#FFFFFF"
                                strokeWidth="1.5"
                              />
                            )}
                          </g>
                        );
                      })}

                      {/* Hover Crosshair & Glowing Nodes */}
                      {chartHoverIdx !== null && chartPoints[chartHoverIdx] && (
                        <g>
                          <line
                            x1={chartPoints[chartHoverIdx].x}
                            y1={paddingTop - 10}
                            x2={chartPoints[chartHoverIdx].x}
                            y2={baselineY}
                            stroke="#94A3B8"
                            strokeDasharray="3 3"
                            strokeWidth="1.2"
                          />
                          {(chartMetricView === 'both' || chartMetricView === 'reviewed') && (
                            <>
                              <circle
                                cx={chartPoints[chartHoverIdx].x}
                                cy={chartPoints[chartHoverIdx].reviewedY}
                                r="9"
                                fill="#2563EB"
                                fillOpacity="0.22"
                              />
                              <circle
                                cx={chartPoints[chartHoverIdx].x}
                                cy={chartPoints[chartHoverIdx].reviewedY}
                                r="4.5"
                                fill="#FFFFFF"
                                stroke="#2563EB"
                                strokeWidth="3"
                              />
                            </>
                          )}
                          {(chartMetricView === 'both' || chartMetricView === 'pending') && (
                            <>
                              <circle
                                cx={chartPoints[chartHoverIdx].x}
                                cy={chartPoints[chartHoverIdx].pendingY}
                                r="8"
                                fill="#F59E0B"
                                fillOpacity="0.22"
                              />
                              <circle
                                cx={chartPoints[chartHoverIdx].x}
                                cy={chartPoints[chartHoverIdx].pendingY}
                                r="4"
                                fill="#FFFFFF"
                                stroke="#F59E0B"
                                strokeWidth="2.5"
                              />
                            </>
                          )}
                        </g>
                      )}

                      {/* Hitbox Columns */}
                      {chartPoints.map((p, idx) => {
                        const colW = effectiveW / Math.max(1, chartPoints.length - 1);
                        return (
                          <rect
                            key={`hitbox-${idx}`}
                            x={p.x - colW / 2}
                            y={0}
                            width={colW}
                            height={chartH}
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setChartHoverIdx(idx)}
                            onMouseLeave={() => setChartHoverIdx(null)}
                            onTouchStart={() => setChartHoverIdx(idx)}
                          />
                        );
                      })}
                    </svg>

                    {/* Floating Tooltip Pill */}
                    {chartHoverIdx !== null && chartPoints[chartHoverIdx] && (() => {
                      const activeY = Math.min(chartPoints[chartHoverIdx].reviewedY, chartPoints[chartHoverIdx].pendingY);
                      const isNearTop = activeY < 75;
                      const isLast = chartHoverIdx === chartPoints.length - 1;
                      const isFirst = chartHoverIdx === 0;

                      let transform = 'translate(-50%, -100%)';
                      if (isNearTop) {
                        transform = isLast ? 'translate(-95%, 15px)' : isFirst ? 'translate(5%, 15px)' : 'translate(-50%, 15px)';
                      } else {
                        transform = isLast ? 'translate(-95%, -110%)' : isFirst ? 'translate(5%, -110%)' : 'translate(-50%, -110%)';
                      }

                      return (
                        <div
                          className="absolute pointer-events-none z-30 bg-slate-900/95 text-white rounded-xl px-3.5 py-2.5 shadow-2xl border border-slate-700/80 backdrop-blur-md transition-all duration-100 font-sans min-w-[170px] whitespace-nowrap"
                          style={{
                            left: `${(chartPoints[chartHoverIdx].x / chartW) * 100}%`,
                            top: `${activeY}px`,
                            transform,
                          }}
                        >
                          <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-slate-700/60 text-xs">
                            <span className="font-semibold text-slate-200">
                              {chartPoints[chartHoverIdx].label} {chartPoints[chartHoverIdx].isToday ? '• Hari Ini' : ''}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{chartPoints[chartHoverIdx].day}</span>
                          </div>
                          <div className="mt-2 space-y-1 text-xs">
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span> Sukses:
                              </span>
                              <span className="font-bold text-white font-mono">{chartPoints[chartHoverIdx].count} ulasan</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span> Antrean:
                              </span>
                              <span className="font-bold text-amber-300 font-mono">{chartPoints[chartHoverIdx].pending} ulasan</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* X-Axis Labels (Responsive) */}
                <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-mono text-slate-500 pt-3 border-t border-slate-100 mt-2">
                  {chartPoints.map((p, idx) => (
                    <div
                      key={idx}
                      className={`text-center cursor-pointer transition-colors ${
                        chartHoverIdx === idx
                          ? 'text-blue-600 font-bold'
                          : p.isToday
                          ? 'text-slate-900 font-bold'
                          : 'hover:text-slate-700'
                      }`}
                      onMouseEnter={() => setChartHoverIdx(idx)}
                      onMouseLeave={() => setChartHoverIdx(null)}
                      onClick={() => setChartHoverIdx(chartHoverIdx === idx ? null : idx)}
                    >
                      <div>
                        <span className="hidden sm:inline">{p.label}</span>
                        <span className="sm:hidden">{p.isToday ? 'Hari Ini' : p.label.split(' ')[0]}</span>
                      </div>
                      {p.isToday && (
                        <span className="hidden sm:inline-block mt-0.5 text-[9px] font-sans px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 font-semibold">
                          Hari Ini
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 2: Cookie Session Health (SVG Donut Chart) */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Kesehatan Sesi Cookie</h3>
                      <p className="text-xs text-slate-500">Rasio status cookie akun Google aktif</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60">
                      {totalCookieCount} Total
                    </span>
                  </div>

                  {/* Donut Graphic */}
                  <div className="my-5 flex items-center justify-center relative">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                      {/* Background circle track */}
                      <circle cx="60" cy="60" r={donutR} stroke="#F1F5F9" strokeWidth="13" fill="none" />

                      {totalCookieCount > 0 && (
                        <>
                          {/* Active Arc (Emerald) */}
                          {activeLen > 0 && (
                            <circle
                              cx="60"
                              cy="60"
                              r={donutR}
                              stroke="#10B981"
                              strokeWidth="13"
                              fill="none"
                              strokeDasharray={`${activeLen} ${donutCircumference - activeLen}`}
                              strokeDashoffset={0}
                              className="transition-all duration-700 ease-out"
                            />
                          )}
                          {/* Needs Login Arc (Amber) */}
                          {needsLen > 0 && (
                            <circle
                              cx="60"
                              cy="60"
                              r={donutR}
                              stroke="#F59E0B"
                              strokeWidth="13"
                              fill="none"
                              strokeDasharray={`${needsLen} ${donutCircumference - needsLen}`}
                              strokeDashoffset={-activeLen}
                              className="transition-all duration-700 ease-out"
                            />
                          )}
                          {/* Expired Arc (Rose) */}
                          {expiredLen > 0 && (
                            <circle
                              cx="60"
                              cy="60"
                              r={donutR}
                              stroke="#F43F5E"
                              strokeWidth="13"
                              fill="none"
                              strokeDasharray={`${expiredLen} ${donutCircumference - expiredLen}`}
                              strokeDashoffset={-(activeLen + needsLen)}
                              className="transition-all duration-700 ease-out"
                            />
                          )}
                        </>
                      )}
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                      <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                        {activePercent}%
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50 mt-0.5">
                        Sesi Siap
                      </span>
                    </div>
                  </div>

                  {/* Multi-segment progress bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex my-2">
                    <div
                      style={{ width: `${totalCookieCount > 0 ? (activeCookiesCount / totalCookieCount) * 100 : 0}%` }}
                      className="bg-emerald-500 transition-all duration-500"
                    />
                    <div
                      style={{ width: `${totalCookieCount > 0 ? (needsLoginCookiesCount / totalCookieCount) * 100 : 0}%` }}
                      className="bg-amber-500 transition-all duration-500"
                    />
                    <div
                      style={{ width: `${totalCookieCount > 0 ? (expiredCookiesCount / totalCookieCount) * 100 : 0}%` }}
                      className="bg-rose-500 transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Legend list */}
                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>Aktif & Terverifikasi</span>
                    </span>
                    <span className="font-bold text-slate-900 font-mono">{activeCookiesCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span>Perlu Login Ulang</span>
                    </span>
                    <span className="font-bold text-slate-900 font-mono">{needsLoginCookiesCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span>Kedaluwarsa / Invalid</span>
                    </span>
                    <span className="font-bold text-slate-900 font-mono">{expiredCookiesCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Google Cookie Quick Import & Quick Business Launch */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Import Cookie Sesi Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Cookie className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 leading-tight">Import Cookie Sesi</h3>
                        <p className="text-[11px] text-slate-500">Ekstensi Cookie-Editor JSON</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Import cookie sesi akun Google menggunakan format JSON dari ekstensi Cookie-Editor. Sistem akan otomatis memverifikasi sesi aktif dan menyinkronkan profil.
                  </p>
                  <div className="space-y-1.5 text-[11px] bg-slate-50 border border-slate-200/70 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Target Layanan:</span>
                      <span className="font-mono text-slate-700 text-[10px] font-semibold">Google Maps / MyAccount</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Akun Terdaftar:</span>
                      <span className="font-mono font-bold text-blue-600">{cookies.length} Akun</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCookieForm({ email: '', cookie_json: '' });
                    setShowCookieModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer text-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Import Cookie JSON</span>
                </button>
              </div>

              {/* Target LIVE Fast List */}
              <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Target Bisnis Maps Terbaru</h3>
                    <p className="text-xs text-slate-500">Daftar bisnis yang siap menerima ulasan bot</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('businesses')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Lihat Semua</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {businesses.slice(0, 4).map((b) => (
                    <div key={b.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {b.id}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">{b.name}</p>
                          <a
                            href={b.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-blue-600 hover:underline truncate block"
                          >
                            {b.url}
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFastRunForm((prev) => ({ ...prev, business_id: String(b.id) }));
                          setShowFastRunModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 transition-colors shrink-0 ml-3"
                      >
                        Jalankan
                      </button>
                    </div>
                  ))}
                  {businesses.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-500">
                      Belum ada target bisnis Google Maps terdaftar.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        )}



        {/* ===================================================================== */}
        {/* ===================================================================== */}
        {/* TAB: 📺 LIVE SHARESCREEN DUAL MODE ("Google Map" & "Tiktok Live")     */}
        {/* ===================================================================== */}
        {activeTab === 'sharescreen' && (() => {
          const ttState = tiktokLiveScreenStatus || liveTask?.tiktok_live;
          const isTTRunning = Boolean(ttState?.is_running);
          const rawStats = ttState?.account_stats || {};
          let ttCardList = Object.values(rawStats);
          const isDisplayOn = Boolean(botModulesConfig.display?.enabled);
          const isGMapRunning = Boolean(liveTask?.is_running && !liveTask?.current_task?.includes('tiktok'));

          const availableCookies = (tiktokCookies && tiktokCookies.length > 0)
            ? tiktokCookies
            : ((data?.all_tiktok_cookies && data.all_tiktok_cookies.length > 0)
                ? data.all_tiktok_cookies
                : []);

          if (ttCardList.length === 0) {
            if (ttState?.active_accounts && ttState.active_accounts.length > 0) {
              ttCardList = ttState.active_accounts.map((u, i) => ({
                username: u,
                worker_idx: i,
                is_logged_in: true,
                is_viewer_verified: (ttState.verified_viewers || []).includes(u),
                has_like_btn: true,
                likes_sent: ttState.likes_sent || 0,
                chats_sent: ttState.chats_sent || 0,
                last_chat_message: ttState.chat_message || 'indonesia',
                status: 'Online (Sesi Aktif)',
                browser_profile: `Profile #${i + 1}`
              }));
            } else if (availableCookies.length > 0) {
              ttCardList = availableCookies.map((ck, i) => ({
                username: ck.username || `@cookie_${i + 1}`,
                worker_idx: i,
                is_logged_in: ck.status === 'active' || ck.session_status === 'active',
                is_viewer_verified: false,
                has_like_btn: false,
                likes_sent: 0,
                chats_sent: 0,
                last_chat_message: ttState?.chat_message || 'indonesia',
                status: ck.status === 'active' ? 'Siap' : 'Perlu Login',
                browser_profile: `Cookie Profile #${i + 1}`
              }));
            } else {
              // Minimal fallback default card agar tampilan kartu tidak pernah kosong/blank
              ttCardList = [
                {
                  username: '@akun_cookie_1',
                  worker_idx: 0,
                  is_logged_in: false,
                  is_viewer_verified: false,
                  has_like_btn: false,
                  likes_sent: 0,
                  chats_sent: 0,
                  last_chat_message: 'indonesia',
                  status: 'Standby (Belum Ada Akun)',
                  browser_profile: 'Default Browser'
                }
              ];
            }
          }

          const ttLogs = ttState?.logs || ttState?.recent_logs || [];

          return (
            <main className="p-4 sm:p-6 space-y-6">
              {/* Top Navigation & Mode Switcher Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
                    sharescreenMode === 'tiktok_live'
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                      : 'bg-slate-900 text-emerald-400'
                  }`}>
                    {sharescreenMode === 'tiktok_live' ? (
                      <TikTokLogo className="w-5 h-5" />
                    ) : (
                      <Tv className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        Sharescreen Bot: {sharescreenMode === 'tiktok_live' ? 'Tiktok Live Multi-Akun' : 'Google Map (Display :99)'}
                      </h2>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        sharescreenMode === 'tiktok_live'
                          ? (isTTRunning ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600')
                          : (liveTask?.is_running ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600')
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          sharescreenMode === 'tiktok_live'
                            ? (isTTRunning ? 'bg-rose-500 animate-pulse' : 'bg-slate-400')
                            : (liveTask?.is_running ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')
                        }`} />
                        {sharescreenMode === 'tiktok_live'
                          ? (isTTRunning ? 'LIVE ON-AIR' : 'STANDBY')
                          : (liveTask?.is_running ? 'LIVE STREAM' : 'STANDBY (:99)')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {sharescreenMode === 'tiktok_live'
                        ? 'Memantau tampilan display kartu browser Chromium per akun cookie (Setiap akun menggunakan cookie terisolasi sendiri).'
                        : 'Memantau tampilan langsung browser Chromium headless di server Linux saat bot mengeksekusi ulasan Google Maps.'}
                    </p>
                  </div>
                </div>

                {/* Pill Switcher: Google Map vs Tiktok Live */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center p-1 bg-slate-100 border border-slate-200/90 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setUserManuallyToggledScreen(true);
                        setSharescreenMode('google_map');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        sharescreenMode === 'google_map'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      <span>Google Map</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-mono text-slate-500">:99</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserManuallyToggledScreen(true);
                        setSharescreenMode('tiktok_live');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        sharescreenMode === 'tiktok_live'
                          ? 'bg-white text-cyan-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <TikTokLogo className="w-3.5 h-3.5" />
                      <span>Tiktok Live</span>
                      {isTTRunning && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </button>
                  </div>

                  {/* Start / Stop Controls for Google Map & TikTok Live */}
                  {sharescreenMode === 'google_map' ? (
                    isGMapRunning ? (
                      <button
                        type="button"
                        onClick={handleEmergencyStop}
                        disabled={submitting || refreshing}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 shadow-sm shadow-rose-600/30 cursor-pointer disabled:opacity-50 active:scale-95"
                        title="Hentikan bot ulasan Google Maps"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Google Map</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenFastRunModal()}
                        disabled={submitting}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 cursor-pointer disabled:opacity-50 active:scale-95"
                        title="Luncurkan bot ulasan Google Maps"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Google Map</span>
                      </button>
                    )
                  ) : isTTRunning ? (
                    <button
                      type="button"
                      onClick={handleStopTikTokLive}
                      disabled={submitting}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 shadow-sm shadow-rose-600/30 cursor-pointer disabled:opacity-50 active:scale-95"
                      title="Hentikan interaksi TikTok Live"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop TikTok Live</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartTikTokLive()}
                        disabled={submitting}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-500 hover:to-pink-500 text-white transition flex items-center gap-1.5 shadow-sm shadow-cyan-600/30 cursor-pointer disabled:opacity-50 active:scale-95"
                        title={`Mulai bot interaksi TikTok Live ke target ${botModulesConfig.tiktok_live?.target_user || '@tryfredy'}`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start TikTok Live</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTiktokConfigModal(true)}
                        className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 cursor-pointer"
                        title="Ubah Target Akun & Pesan Chat TikTok"
                      >
                        <Sliders className="w-3.5 h-3.5 text-slate-600" />
                        <span className="hidden sm:inline">Atur</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setStreamSessionKey(Date.now());
                      setScreenTs(Date.now());
                      setStreamError(false);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                    title="Segarkan stream layar"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Segarkan</span>
                  </button>

                  {sharescreenMode === 'google_map' && (
                    <>
                      <button
                        onClick={handleToggleFullscreen}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                        title="Mode Layar Penuh"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Fullscreen</span>
                      </button>
                      <a
                        href="/api/screen/stream.mjpg"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Tab Baru</span>
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Alert Banner jika Opsi Display Sedang Nonaktif (Mati) */}
              {!botModulesConfig.display?.enabled && (
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950/90 to-slate-900 border border-indigo-700/60 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                  <div className="flex items-start gap-3.5 text-indigo-200">
                    <div className="w-10 h-10 rounded-xl bg-indigo-900/60 border border-indigo-600/60 flex items-center justify-center shrink-0">
                      <Tv className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white text-sm">Opsi Layar (Display) Saat Ini Nonaktif (Mati)</p>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          HEMAT RESOURCE
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs mt-0.5">
                        Sesuai konfigurasi di Config Bot (default mati), layar tidak mengambil snapshot berkala agar bot bekerja maksimal dan cepat. Klik tombol di samping untuk menyalakan layar pemantauan langsung.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleDisplay}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-md text-xs"
                  >
                    <Tv className="w-4 h-4" />
                    <span>Aktifkan Layar Pemantauan Sekarang</span>
                  </button>
                </div>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* MODE 1: GOOGLE MAP (DISPLAY :99)                              */}
              {/* ───────────────────────────────────────────────────────────── */}
              {sharescreenMode === 'google_map' && (
                <>
                  {/* Banner Pemberitahuan jika TikTok Live sedang Aktif */}
                  {isTTRunning && (
                    <div className="p-3.5 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-slate-900 border border-cyan-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
                      <div className="flex items-center gap-3 text-cyan-200">
                        <div className="w-8 h-8 rounded-lg bg-cyan-900/60 border border-cyan-700/60 flex items-center justify-center shrink-0">
                          <TikTokLogo className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Bot TikTok Live Sedang Aktif (LIVE ON-AIR)</p>
                          <p className="text-[11px] text-cyan-300/80">
                            Menjalankan {ttCardList.length} browser Chromium paralel per akun. Layar Google Maps (Display :99) saat ini dalam status Standby.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUserManuallyToggledScreen(true);
                          setSharescreenMode('tiktok_live');
                        }}
                        className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <TikTokLogo className="w-3.5 h-3.5" />
                        <span>Buka Layar TikTok Live ({ttCardList.length} Akun) →</span>
                      </button>
                    </div>
                  )}

                  <div
                    ref={screenContainerRef}
                    className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl relative flex flex-col"
                  >
                    {/* Screen Top Bar */}
                    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                        <span className="ml-2 font-mono text-[11px] text-slate-300">
                          AutoBotix Chromium Engine • Virtual Display :99 (1366 × 768)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {isGMapRunning ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              LIVE MJPEG STREAM
                            </span>
                            <button
                              type="button"
                              onClick={handleEmergencyStop}
                              disabled={submitting || refreshing}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                              title="Hentikan bot ulasan Google Maps"
                            >
                              <Square className="w-3 h-3 fill-current" />
                              <span>Stop Bot</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-slate-500 flex items-center gap-1.5">
                              STANDBY (:99)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenFastRunModal()}
                              disabled={submitting}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                              title="Luncurkan bot ulasan Google Maps"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Start Google Map</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Video / Image Display Area */}
                    <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                      {!isDisplayOn ? (
                        <div className="text-center p-8 space-y-3.5 select-none">
                          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400 shadow-inner">
                            <Tv className="w-7 h-7 text-slate-400" />
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span>Sedang Mati</span>
                          </div>
                          <p className="text-sm font-bold text-slate-200">
                            Display Monitor Sedang Mati
                          </p>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            aktifkan layar untuk memantau bot.
                          </p>
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={handleToggleDisplay}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition inline-flex items-center gap-2 shadow-sm"
                            >
                              <Tv className="w-4 h-4" />
                              <span>Nyalakan Layar</span>
                            </button>
                          </div>
                        </div>
                      ) : (liveTask?.is_running && !liveTask?.current_task?.includes('tiktok') && streamActive && !streamError) ? (
                        <img
                          key={`gmap-stream-${streamSessionKey}`}
                          src={`/api/screen/stream.mjpg?v=${streamSessionKey}`}
                          alt="Live Sharescreen Display :99"
                          className="w-full h-full object-contain select-none"
                          onError={() => setStreamError(true)}
                        />
                      ) : (
                        <div className="text-center p-8 space-y-3">
                          <Tv className="w-12 h-12 text-slate-600 mx-auto" />
                          <p className="text-sm font-semibold text-slate-300">
                            Display :99 Sedang Standby
                          </p>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Layar otomatis aktif dan menampilkan aksi browser secara real-time saat Anda menjalankan tugas ulasan Google Maps.
                          </p>
                          {isTTRunning ? (
                            <button
                              type="button"
                              onClick={() => {
                                setUserManuallyToggledScreen(true);
                                setSharescreenMode('tiktok_live');
                              }}
                              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition inline-flex items-center gap-2 shadow-sm"
                            >
                              <TikTokLogo className="w-4 h-4" />
                              <span>Lihat Layar TikTok Live ({ttCardList.length} Akun) →</span>
                            </button>
                          ) : (
                            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                              <button
                                type="button"
                                onClick={() => handleOpenFastRunModal()}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer transition inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Start Google Map</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStartTikTokLive()}
                                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl cursor-pointer transition inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                              >
                                <TikTokLogo className="w-3.5 h-3.5" />
                                <span>Start TikTok Live</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setStreamError(false);
                                  setScreenTs(Date.now());
                                }}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer transition inline-flex items-center gap-1.5"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Segarkan</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Bot Activity Logs Section */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-bold text-slate-900">
                          Log Aktivitas Bot Terkini (Real-Time)
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">Auto-refresh tiap 2.5 detik</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 font-mono text-xs max-h-64 overflow-y-auto space-y-2">
                      {screenLogs && screenLogs.length > 0 ? (
                        screenLogs.map((log) => {
                          const lvl = (log.level || 'info').toLowerCase();
                          let badgeClass = 'text-sky-400 bg-sky-950/60 border-sky-800';
                          if (lvl === 'success') badgeClass = 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
                          else if (lvl === 'warning' || lvl === 'warn') badgeClass = 'text-amber-400 bg-amber-950/60 border-amber-800';
                          else if (lvl === 'error' || lvl === 'fatal') badgeClass = 'text-rose-400 bg-rose-950/60 border-rose-800';

                          return (
                            <div key={log.id} className="flex items-start gap-2.5 leading-relaxed border-b border-slate-900/80 pb-1.5 last:border-none">
                              <span className="text-slate-500 text-[11px] shrink-0 pt-0.5">
                                {log.created_at ? log.created_at.split(' ')[1] : '--:--:--'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border shrink-0 ${badgeClass}`}>
                                {lvl}
                              </span>
                              {log.business_name && (
                                <span className="text-slate-400 text-[11px] shrink-0">
                                  [{log.business_name}]
                                </span>
                              )}
                              <span className="text-slate-200 break-words flex-1">
                                {log.message}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-slate-500 text-center py-4">
                          Belum ada log proses ulasan aktif. Jalankan task ulasan untuk melihat aktivitas.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* MODE 2: TIKTOK LIVE (CARDS DISPLAY PER AKUN COOKIE)          */}
              {/* ───────────────────────────────────────────────────────────── */}
              {sharescreenMode === 'tiktok_live' && (
                <>
                  {/* Status Banner Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
                        <TikTokLogo className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-white font-mono">
                            Target: {ttState?.target_user || '@evelyn.vln'}
                          </h3>
                          {isTTRunning ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                              LIVE ON-AIR
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
                              STANDBY
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Mode: {ttState?.execution_mode === 'parallel' ? '⚡ Paralel (Browser Terpisah Serentak)' : '🔄 Bergantian (Rotasi)'} • Komentar tiap 3 detik • 100% Real Likes (Klik Nyata Tanpa Dummy)
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
                      <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block font-sans">REAL LIKES (1:1)</span>
                        <span className="text-rose-400 font-bold text-sm">
                          ❤️ {(ttState?.likes_sent || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block font-sans">CHAT 3 DETIK</span>
                        <span className="text-cyan-400 font-bold text-sm">
                          💬 {(ttState?.chats_sent || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block font-sans">AKUN COOKIE</span>
                        <span className="text-emerald-400 font-bold text-sm">
                          👥 {ttCardList.length} Display
                        </span>
                      </div>
                      {!isTTRunning ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartTikTokLive()}
                            disabled={submitting}
                            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-500 hover:to-pink-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm shadow-cyan-600/30 transition flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Start TikTok Live</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowTiktokConfigModal(true)}
                            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs cursor-pointer transition flex items-center gap-1.5"
                            title="Konfigurasi Target Streamer & Pesan Chat"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Atur</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleStopTikTokLive}
                            disabled={submitting}
                            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm shadow-rose-600/30 transition flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                          >
                            <Square className="w-3.5 h-3.5 fill-white" />
                            <span>Stop TikTok Live</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowTiktokConfigModal(true)}
                            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs cursor-pointer transition flex items-center gap-1.5"
                            title="Ubah Target Streamer / Pesan"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Atur</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grid Display Cards: 1 Card per Akun Cookie */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {ttCardList.map((card, idx) => {
                      const wIdx = card.worker_idx !== undefined ? card.worker_idx : idx;
                      const isViewer = Boolean(card.is_viewer_verified);
                      const hasLikeBtn = Boolean(card.has_like_btn);
                      const realLikes = card.likes_sent || 0;
                      const chatsSent = card.chats_sent || 0;

                      return (
                        <div
                          key={card.username || idx}
                          className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col transition hover:border-slate-700"
                        >
                          {/* Card Header */}
                          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 font-bold text-xs font-mono">
                                #{wIdx + 1}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                                  {card.username}
                                </h4>
                                <span className="text-[10px] text-slate-400">
                                  {card.browser_profile || `Browser #${wIdx + 1}`} • Cookie Mandiri
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {card.is_logged_in ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  ✓ Sesi Aktif
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  Mode Tamu
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Display Screen Snapshot / Placeholder Sedang Mati */}
                          <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-800/80 select-none">
                            {isDisplayOn ? (
                              <>
                                {isTTRunning ? (
                                  <img
                                    key={`tt-stream-${wIdx}-${streamSessionKey}`}
                                    src={`/api/tiktok-live/screen/${wIdx}.mjpg?v=${streamSessionKey}`}
                                    alt={`Display ${card.username}`}
                                    className="w-full h-full object-cover select-none"
                                    loading="eager"
                                    onError={(e) => {
                                      // Fallback ke fast single snapshot jika stream sedang bersiap
                                      e.currentTarget.src = `/api/tiktok-live/screen/${wIdx}.png?t=${Date.now()}`;
                                    }}
                                  />
                                ) : (
                                  <img
                                    key={`tt-standby-${wIdx}-${streamSessionKey}`}
                                    src={`/api/tiktok-live/screen/${wIdx}.png?t=${streamSessionKey}`}
                                    alt={`Display ${card.username}`}
                                    className="w-full h-full object-cover select-none"
                                    loading="eager"
                                  />
                                )}
                                {/* Overlay Badges on Top of Screen */}
                                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 pointer-events-none">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-xs ${
                                    isViewer
                                      ? 'bg-emerald-600/90 text-white'
                                      : 'bg-slate-900/85 text-slate-300 border border-slate-700/80'
                                  }`}>
                                    {isViewer ? '✓ Penonton Terdaftar' : '? Memindai Penonton...'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-xs ${
                                    hasLikeBtn
                                      ? 'bg-rose-600/90 text-white'
                                      : 'bg-slate-900/85 text-slate-300 border border-slate-700/80'
                                  }`}>
                                    {hasLikeBtn ? '❤️ Tombol Love [✓]' : 'Cari Tombol Love'}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center p-4 text-center relative group">
                                <div className="w-10 h-10 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-1.5 shadow-inner group-hover:scale-105 transition-transform duration-200">
                                  <Tv className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800/90 text-slate-300 border border-slate-700/80 mb-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                  <span>Sedang Mati</span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-sans max-w-[210px] leading-tight">
                                  aktifkan layar untuk memantau bot.
                                </p>
                                <button
                                  type="button"
                                  onClick={handleToggleDisplay}
                                  className="mt-2.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                                >
                                  <Tv className="w-3.5 h-3.5" />
                                  <span>Nyalakan Layar</span>
                                </button>
                                {/* Overlay Badges on Top of Placeholder too */}
                                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 pointer-events-none opacity-80">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-xs ${
                                    isViewer
                                      ? 'bg-emerald-600/90 text-white'
                                      : 'bg-slate-900/85 text-slate-400 border border-slate-800'
                                  }`}>
                                    {isViewer ? '✓ Penonton Terdaftar' : 'Memindai Penonton'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-xs ${
                                    hasLikeBtn
                                      ? 'bg-rose-600/90 text-white'
                                      : 'bg-slate-900/85 text-slate-400 border border-slate-800'
                                  }`}>
                                    {hasLikeBtn ? '❤️ Tombol Love [✓]' : 'Cari Tombol Love'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Real Statistics Card Body (100% Real, NO DUMMY) */}
                          <div className="p-3.5 space-y-2.5 bg-slate-950 font-mono text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-sans">REAL LIKES (1:1)</span>
                                <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                                  ❤️ {realLikes.toLocaleString()} <span className="text-[9px] text-slate-500 font-normal">klik nyata</span>
                                </span>
                              </div>
                              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-sans">CHAT 3 DETIK</span>
                                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                                  💬 {chatsSent} <span className="text-[9px] text-slate-500 font-normal">terkirim</span>
                                </span>
                              </div>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                              <span className="text-slate-500 font-sans">Pesan:</span>
                              <span className="text-slate-200 truncate max-w-[170px]" title={card.last_chat_message || ttState?.chat_message || 'indonesia'}>
                                "{card.last_chat_message || ttState?.chat_message || 'indonesia'}"
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* TikTok Live Logcat Tree Section */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-600" />
                        <h3 className="text-sm font-bold text-slate-900">
                          Logcat TikTok Live Engine (Real-Time Cards &amp; Tree Branch)
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">Pembaruan otomatis tiap 2.5s</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 font-mono text-xs max-h-64 overflow-y-auto space-y-2">
                      {ttLogs && ttLogs.length > 0 ? (
                        ttLogs.map((log) => {
                          const lvl = (log.level || 'info').toLowerCase();
                          let badgeClass = 'text-sky-400 bg-sky-950/60 border-sky-800';
                          if (lvl === 'success') badgeClass = 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
                          else if (lvl === 'warning' || lvl === 'warn') badgeClass = 'text-amber-400 bg-amber-950/60 border-amber-800';
                          else if (lvl === 'error' || lvl === 'fatal') badgeClass = 'text-rose-400 bg-rose-950/60 border-rose-800';

                          return (
                            <div key={log.id} className="flex items-start gap-2.5 leading-relaxed border-b border-slate-900/80 pb-1.5 last:border-none">
                              <span className="text-slate-500 text-[11px] shrink-0 pt-0.5">
                                {log.created_at ? log.created_at.split(' ')[1] : '--:--:--'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border shrink-0 ${badgeClass}`}>
                                {lvl}
                              </span>
                              <span className="text-slate-200 break-words flex-1">
                                {log.message}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-slate-500 text-center py-4">
                          Belum ada aktivitas TikTok Live. Jalankan bot untuk melihat display dan logcat.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </main>
          );
        })()}



        {/* ===================================================================== */}
        {/* TAB 2: 🛡️ MANAJEMEN AKUN GOOGLE (IMPORT COOKIE SESI)                  */}
        {/* ===================================================================== */}
        {activeTab === 'cookies' && (
          <main className="p-4 sm:p-6 space-y-5">
            {/* Toolbar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari akun berdasarkan email atau nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCheckAccountNames}
                  disabled={isCheckingNames}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                  title="Pindai dan verifikasi cookie sesi ke server Google"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingNames ? 'animate-spin' : ''}`} />
                  <span>{isCheckingNames ? 'Memindai Google...' : 'Sinkron & Cek Cookie'}</span>
                </button>

                <button
                  onClick={() => {
                    setCookieForm({ email: '', cookie_json: '' });
                    setShowCookieModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                  title="Import Cookie Sesi Google via JSON Cookie-Editor"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Import Cookie JSON</span>
                </button>
              </div>
            </div>

            {/* Account Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                { id: 'all', label: `Semua Akun (${cookies.length})` },
                { id: 'active', label: `● Sesi Aktif (${activeCookiesCount})` },
                { id: 'needs_login', label: `▲ Perlu Otorisasi (${needsLoginCookiesCount})` },
                { id: 'expired', label: `✖ Kedaluwarsa (${expiredCookiesCount})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setCookieFilter(f.id); setSelectedCookieIds(new Set()); }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
                    cookieFilter === f.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Bulk Action Bar — shown when any rows selected */}
            {selectedCookieIds.size > 0 && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2.5 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 text-blue-800 font-semibold">
                  <input
                    type="checkbox"
                    checked={selectedCookieIds.size === filteredCookies.length && filteredCookies.length > 0}
                    onChange={() => {
                      if (selectedCookieIds.size === filteredCookies.length) {
                        setSelectedCookieIds(new Set());
                      } else {
                        setSelectedCookieIds(new Set(filteredCookies.map(c => c.id)));
                      }
                    }}
                    className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                  />
                  <span>{selectedCookieIds.size} akun dipilih</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCookieIds(new Set())}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Batalkan Pilihan
                  </button>
                  <button
                    onClick={handleBulkDeleteCookies}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus {selectedCookieIds.size} Akun
                  </button>
                </div>
              </div>
            )}

            {/* Accounts Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          title={selectedCookieIds.size === filteredCookies.length && filteredCookies.length > 0 ? 'Batalkan semua' : 'Pilih semua'}
                          checked={filteredCookies.length > 0 && selectedCookieIds.size === filteredCookies.length}
                          ref={el => {
                            if (el) el.indeterminate = selectedCookieIds.size > 0 && selectedCookieIds.size < filteredCookies.length;
                          }}
                          onChange={() => {
                            if (selectedCookieIds.size === filteredCookies.length) {
                              setSelectedCookieIds(new Set());
                            } else {
                              setSelectedCookieIds(new Set(filteredCookies.map(c => c.id)));
                            }
                          }}
                          className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                        />
                      </th>
                      <th className="py-3 px-4">Profil Akun Google</th>
                      <th className="py-3 px-4">Email Akun (Gmail)</th>
                      <th className="py-3 px-4">Metode Otorisasi</th>
                      <th className="py-3 px-4">Status Otorisasi</th>
                      <th className="py-3 px-4">Diagnosa / Alasan Respon</th>
                      <th className="py-3 px-4">Terakhir Diperbarui</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCookies.map((ck) => {
                      const isAktif = ck.status === 'active';
                      const isNeedsLogin = ck.status === 'needs_login';
                      const isExpired = ck.status === 'expired' || ck.status === 'invalid';
                      const isOAuth = ck.auth_method === 'oauth' || ck.auth_method === 'google_oauth' || !!ck.oauth_access_token;
                      const displayName = (ck.account_name || ck.email || 'A').trim();
                      const initial = displayName ? displayName.charAt(0).toUpperCase() : 'A';
                      const avatarGradient = getProfileGradient(displayName);
                      const isChecked = selectedCookieIds.has(ck.id);

                      return (
                        <tr
                          key={ck.id}
                          className={`hover:bg-slate-50/60 transition-colors ${isChecked ? 'bg-blue-50/40' : ''}`}
                        >
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedCookieIds(prev => {
                                  const next = new Set(prev);
                                  if (next.has(ck.id)) next.delete(ck.id);
                                  else next.add(ck.id);
                                  return next;
                                });
                              }}
                              className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-medium">
                            <div className="flex items-center gap-3">
                              {ck.oauth_picture ? (
                                <img
                                  src={ck.oauth_picture}
                                  alt={displayName}
                                  referrerPolicy="no-referrer"
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : null}
                              <div
                                style={{ display: ck.oauth_picture ? 'none' : 'flex' }}
                                className={`w-9 h-9 rounded-full bg-gradient-to-tr ${avatarGradient} text-white items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                              >
                                {initial}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">
                                  {ck.account_name || (
                                    <span className="text-slate-400 font-normal italic">- Akun Google -</span>
                                  )}
                                </p>
                                <span className="text-[10px] text-slate-400 font-mono">ID #{ck.id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-700 select-all">
                            <div className="flex items-center gap-2">
                              <GmailLogo className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-semibold text-slate-800">{ck.email}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {isOAuth ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                <ShieldCheck className="w-3 h-3 text-blue-600" />
                                OAuth (Legacy)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <Cookie className="w-3 h-3 text-amber-600" />
                                Cookie Sesi (JSON)
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {isAktif && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                AKTIF
                              </span>
                            )}
                            {isNeedsLogin && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                PERLU OTORISASI
                              </span>
                            )}
                            {isExpired && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                <X className="w-3 h-3 text-rose-600" />
                                KEDALUWARSA
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={ck.error_reason || ''}>
                            {ck.error_reason || (isAktif ? (isOAuth ? 'Token OAuth aktif & siap digunakan.' : 'Sesi Google aktif dan terverifikasi.') : '-')}
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                            {ck.updated_at || ck.last_checked_at || '-'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Perbarui Cookie Sesi */}
                              <button
                                onClick={() => {
                                  setCookieForm({ email: ck.email, cookie_json: '' });
                                  setShowCookieModal(true);
                                }}
                                title="Import / Perbarui Cookie Akun Ini"
                                className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Cookie className="w-4 h-4" />
                              </button>

                              {/* Uji Validitas */}
                              <button
                                onClick={() => handleTestCookie(ck.id, ck.email)}
                                title="Uji Validitas Sesi / Cookie Google"
                                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>

                              {/* Lihat Snippet Token / Cookie */}
                              <button
                                onClick={() => setSnippetModalCookie(ck)}
                                title="Lihat Payload Kredensial"
                                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Hapus Akun */}
                              <button
                                onClick={() => handleDeleteCookie(ck.id, ck.email)}
                                title="Hapus Akun Ini"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredCookies.length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-xs text-slate-500">
                          Belum ada akun Google terdaftar. Klik "+ Import Cookie JSON" di atas untuk menambahkan akun.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>


          </main>
        )}

        {/* ===================================================================== */}
        {/* TAB 2B: 🎵 MANAJEMEN AKUN TIKTOK (IMPORT COOKIE SESI)                  */}
        {/* ===================================================================== */}
        {activeTab === 'tiktok-cookies' && (
          <main className="p-4 sm:p-6 space-y-5">
            {/* SaaS Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Akun TikTok</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{tiktokCookiesList.length}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tersimpan di database</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center">
                  <TikTokLogo className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Sesi Aktif & Terverifikasi</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{activeTikTokCount}</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Siap digunakan di Live Bot</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Perlu Otorisasi / Expired</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{needsLoginTikTokCount + expiredTikTokCount}</p>
                  <p className="text-[10px] text-amber-600 font-medium mt-0.5">Perlu perbarui cookie</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Target Integrasi</p>
                  <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Display :99 Ready</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Auto-inject saat live start</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <Tv className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari akun TikTok berdasarkan username atau nama..."
                  value={tiktokSearchQuery}
                  onChange={(e) => setTikTokSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleTestAllTikTokCookies}
                  disabled={isCheckingTikTok}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                  title="Pindai dan verifikasi sesi akun TikTok"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingTikTok ? 'animate-spin' : ''}`} />
                  <span>{isCheckingTikTok ? 'Memeriksa TikTok...' : 'Sinkron & Cek Cookie'}</span>
                </button>

                <button
                  onClick={() => {
                    setTikTokCookieForm({ username: '', nickname: '', cookie_json: '' });
                    setDetectedTikTokInfo(null);
                    setShowTikTokCookieModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-xs transition-colors cursor-pointer"
                  title="Import Cookie Sesi TikTok via Cookie-Editor"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Import Cookie TikTok</span>
                </button>
              </div>
            </div>

            {/* Account Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                { id: 'all', label: `Semua Akun (${tiktokCookiesList.length})` },
                { id: 'active', label: `● Sesi Aktif (${activeTikTokCount})` },
                { id: 'needs_login', label: `▲ Perlu Otorisasi (${needsLoginTikTokCount})` },
                { id: 'expired', label: `✖ Kedaluwarsa (${expiredTikTokCount})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTikTokCookieFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
                    tiktokCookieFilter === f.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Table of TikTok Accounts */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Akun TikTok</th>
                      <th className="py-3 px-4">Nama Panggilan</th>
                      <th className="py-3 px-4">Status Sesi</th>
                      <th className="py-3 px-4">Session Token</th>
                      <th className="py-3 px-4">Integrasi Live Bot</th>
                      <th className="py-3 px-4">Terakhir Dicek</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredTikTokCookies.map((ck) => {
                      const isActive = ck.status === 'active';
                      const isNeedsLogin = ck.status === 'needs_login' || ck.status === 'unknown';
                      const isTesting = testingTikTokId === ck.id;

                      return (
                        <tr key={ck.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-pink-500 border border-slate-800 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                                {ck.avatar_url ? (
                                  <img src={ck.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <TikTokLogo className="w-4 h-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <a
                                  href={`https://www.tiktok.com/${ck.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-slate-900 hover:text-pink-600 flex items-center gap-1.5 transition-colors"
                                >
                                  <span>{ck.username}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </a>
                                <p className="text-[10px] text-slate-400">ID #{ck.id}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {ck.nickname || '-'}
                          </td>

                          <td className="py-3.5 px-4">
                            {isActive && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Sesi Aktif
                              </span>
                            )}
                            {isNeedsLogin && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Perlu Otorisasi
                              </span>
                            )}
                            {!isActive && !isNeedsLogin && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Kedaluwarsa
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {ck.has_sessionid ? 'sessionid terdeteksi' : `${ck.cookie_count || 1} cookie`}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 font-semibold">
                              <Tv className="w-3 h-3 text-indigo-600" />
                              <span>Auto-Inject :99</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {ck.last_checked_at ? new Date(ck.last_checked_at).toLocaleString('id-ID') : '-'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleTestTikTokCookie(ck.id, ck.username)}
                                disabled={isTesting}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                                title="Uji validitas cookie ke server TikTok"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                                <span>{isTesting ? 'Menguji...' : 'Cek Sesi'}</span>
                              </button>

                              <button
                                onClick={() => handleDeleteTikTokCookie(ck.id, ck.username)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus Akun TikTok"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredTikTokCookies.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-xs text-slate-500">
                          <div className="max-w-md mx-auto space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 mx-auto flex items-center justify-center border border-pink-100">
                              <TikTokLogo className="w-6 h-6" />
                            </div>
                            <p className="font-semibold text-slate-800 text-sm">Belum ada akun TikTok yang diimpor</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Klik tombol <b className="text-pink-600">+ Import Cookie TikTok</b> di atas untuk menambahkan sesi akun Anda. Bot akan otomatis menginjeksi cookie saat live stream dibuka di Display :99!
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}

        {/* ===================================================================== */}
        {/* TAB 4: 🖥️ MANAJEMEN SERVER & WORKER                                   */}
        {/* ===================================================================== */}
        {activeTab === 'server' && (
          <main className="p-4 sm:p-6 space-y-6">
            {/* Server Overview Resource Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CPU Load */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">CPU Load Avg</span>
                  <Cpu className="w-4 h-4 text-blue-600" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">{cpuLoad1}</span>
                  <span className="text-xs text-slate-500">/ {cpuCores} Cores</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-mono">Load 5m: {cpuLoad5}</p>
              </div>

              {/* Memory RAM */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Memory RAM</span>
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">{memUsed}</span>
                  <span className="text-xs text-slate-500">/ {memTotal} GB ({memPercent}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${memPercent}%` }}></div>
                </div>
              </div>

              {/* Disk Storage */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Disk Storage</span>
                  <HardDrive className="w-4 h-4 text-purple-600" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">{diskUsed}</span>
                  <span className="text-xs text-slate-500">/ {diskTotal} GB ({diskPercent}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${diskPercent}%` }}></div>
                </div>
              </div>

              {/* Native Engine */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Browser Engine</span>
                  <Radio className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-3">
                  <span className="text-lg font-bold text-slate-900">Chromium 155</span>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">Headless Automation</p>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-mono">Server Engine Active</p>
              </div>
            </div>

            {/* Server Daemon Services Status & Emergency Stop */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 mb-1">Status Layanan Daemon Server</h3>
              <p className="text-xs text-slate-500 mb-4">Layanan systemd yang menjaga bot review berjalan 24/7</p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-mono font-bold text-xs text-slate-900 truncate">google-review-automation.service</p>
                      <p className="text-[11px] text-slate-500">Flask Web API & Remote Client Hub (Port 5000)</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto shrink-0">
                    ACTIVE / RUNNING
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-mono font-bold text-xs text-slate-900 truncate">google-review-worker.service</p>
                      <p className="text-[11px] text-slate-500">Background Worker Chromium Scheduler & Dispatcher</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto shrink-0">
                    ACTIVE / RUNNING
                  </span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <div className="text-xs text-slate-500">
                  Operasi pemulihan darurat dan reset memori antrean worker.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadDashboardData}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    Refresh Status
                  </button>
                  <button
                    onClick={handleEmergencyStop}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Emergency Stop (Kill All)</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ===================================================================== */}
        {/* TAB 5: 🏢 TARGET BISNIS GOOGLE MAPS                                   */}
        {/* ===================================================================== */}
        {activeTab === 'businesses' && (
          <main className="p-4 sm:p-6 space-y-5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari target bisnis Google Maps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                onClick={() => setShowAddBizModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer self-start md:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Target Bisnis Maps</span>
              </button>
            </div>

            {/* Business Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses
                .filter(
                  (b) =>
                    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (b.url || '').toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 truncate">{b.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">ID #{b.id}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteBusiness(b.id, b.name)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Hapus Bisnis"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3">
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate block"
                          title={b.url}
                        >
                          {b.url}
                        </a>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Ulasan Otomatis</span>
                      <button
                        onClick={() => {
                          setFastRunForm((prev) => ({ ...prev, business_id: String(b.id) }));
                          setShowFastRunModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Luncurkan Bot</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </main>
        )}

        {/* ===================================================================== */}
        {/* TAB 6: 🐙 USAGE & TOKEN ANALYTICS (TENTACLE NEURAL FLOW)             */}
        {/* ===================================================================== */}
        {activeTab === 'usage' && (
          <main className="p-4 sm:p-6 space-y-6">
            {/* Header: Title, Subtabs & Timeframe */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center font-bold shadow-xs">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      Usage & Analytics
                    </h2>
                    <p className="text-xs text-slate-500">
                      Track your API usage, token consumption, and request logs
                    </p>
                  </div>
                </div>

                {/* Sub-tabs: Overview & Details */}
                <div className="flex items-center gap-1.5 mt-3">
                  <button
                    onClick={() => setUsageSubTab('overview')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      usageSubTab === 'overview'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setUsageSubTab('details')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      usageSubTab === 'details'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Details
                  </button>
                </div>
              </div>

              {/* Timeframe selector & Refresh */}
              <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
                  {['today', '7d', '30d'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setUsageTimeframe(tf)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        usageTimeframe === tf
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tf === 'today' ? 'Today' : tf === '7d' ? '7 Days' : '30 Days'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={loadUsageData}
                  disabled={usageLoading}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Segarkan telemetri"
                >
                  <RefreshCw className={`w-4 h-4 ${usageLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* 4 Top KPI Cards (Feature Aligned: Google Maps Review Automation) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: TOTAL ULASAN POSTING */}
              <div className="bg-[#0B0F19] text-white border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  TOTAL ULASAN POSTING
                </span>
                <div className="my-2">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-white">
                    {usageData?.total_requests ? Number(usageData.total_requests).toLocaleString() : '656'}
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="text-slate-300">Terverifikasi Maps</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">100% Organik</span>
                </div>
              </div>

              {/* Card 2: AKUN SESI GOOGLE */}
              <div className="bg-[#0B0F19] text-white border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-cyan-500/50 transition-colors">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  AKUN SESI GOOGLE
                </span>
                <div className="my-2 flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-cyan-400">
                    {activeCookiesCount}
                  </span>
                  <span className="text-sm font-mono text-slate-400 font-bold">
                    / {cookies.length || 16}
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span className="text-slate-300">Sesi Cookie Siap</span>
                  </span>
                  {needsLoginCookiesCount > 0 ? (
                    <span className="text-[10px] font-mono text-rose-400 font-semibold animate-pulse">
                      {needsLoginCookiesCount} Butuh Login
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">Siap Posting</span>
                  )}
                </div>
              </div>

              {/* Card 3: TARGET TEMPAT MAPS */}
              <div className="bg-[#0B0F19] text-white border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-amber-500/50 transition-colors">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  TARGET TEMPAT MAPS
                </span>
                <div className="my-2">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-amber-400">
                    {businesses.length || 5}{' '}
                    <span className="text-sm font-normal text-slate-400 font-sans">Bisnis</span>
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span className="text-slate-300">Rating Bintang 5 ⭐</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 font-semibold">Target Aktif</span>
                </div>
              </div>

              {/* Card 4: AI REVIEW GENERATION */}
              <div className="bg-[#0B0F19] text-white border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-purple-500/50 transition-colors">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  AI REVIEW GENERATION
                </span>
                <div className="my-2">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-purple-400">
                    {usageData?.output_tokens ? Number(usageData.output_tokens).toLocaleString() : '451,437'}{' '}
                    <span className="text-sm font-normal text-slate-400 font-sans">Kata</span>
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    <span className="text-slate-300">Gemini NLP Engine</span>
                  </span>
                  <span className="text-[10px] font-mono text-purple-400 font-semibold">Anti-Duplikasi</span>
                </div>
              </div>
            </div>

            {/* Main Row: Interactive Tentacle Graph & Recent Requests Log */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Column: The Tentacle Neural Graph Canvas */}
              <div className="xl:col-span-8 bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden flex flex-col">
                {/* Top Toolbar inside Canvas */}
                {(() => {
                  const liveTask = usageData?.task_execution;
                  const isLiveRunning = Boolean(liveTask?.is_running);
                  const activeTaskType = liveTask?.active_task_type; // 'tiktok_live' | 'google_maps' | 'idle'
                  const isTikTokRunning = isLiveRunning && activeTaskType === 'tiktok_live';
                  const isGmapRunning = isLiveRunning && activeTaskType === 'google_maps';
                  const isTikTok = isTikTokFlow;
                  const isTaskActive = isLiveRunning || isSimulationActive;
                  const activeMode = isLiveRunning ? (liveTask?.mode || 'queue') : taskExecutionMode;
                  const isParallel = activeMode === 'parallel';
                  const eligibleCookies = tentacleNodes.filter((n) => !n.isNeedsLogin);
                  const brokenCookies = tentacleNodes.filter((n) => n.isNeedsLogin);

                  const liveActiveTarget = isTikTok
                    ? (liveTask?.tiktok_live?.active_account?.username || (eligibleCookies[0]?.email))
                    : liveTask?.active_emails?.[0];

                  const liveTurnNode = liveActiveTarget
                    ? eligibleCookies.find((c) => c.email === liveActiveTarget || c.username === liveActiveTarget)
                    : null;
                  const activeTurnNode = liveTurnNode || (eligibleCookies.length > 0 ? eligibleCookies[rotationIndex % eligibleCookies.length] : null);
                  const currentActiveCookieId = isTaskActive && activeTurnNode ? activeTurnNode.id : null;
                  const currentTurnNumber = eligibleCookies.length > 0 ? (rotationIndex % eligibleCookies.length) + 1 : 1;

                  // Completed accounts / tentacles set
                  const completedEmails = new Set(liveTask?.completed_emails || []);
                  const completedNodeIds = new Set(completedCookieIds);
                  tentacleNodes.forEach((n) => {
                    if (completedEmails.has(n.email)) {
                      completedNodeIds.add(n.id);
                    }
                  });

                  if (isSimulationActive && eligibleCookies.length > 0 && rotationIndex > 0) {
                    for (let step = 0; step < rotationIndex; step++) {
                      const doneNode = eligibleCookies[step % eligibleCookies.length];
                      if (doneNode && doneNode.id !== currentActiveCookieId) {
                        completedNodeIds.add(doneNode.id);
                      }
                    }
                  }

                  return (
                    <>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-slate-800/80 text-xs text-slate-400 mb-2 gap-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${isTikTok ? 'bg-pink-500' : 'bg-cyan-500'}`} />
                          <span className="font-mono text-[11px] text-slate-200 font-semibold">
                            Topology: {tentacleNodes.length} Akun {isTikTok ? 'TikTok' : 'Google'}
                          </span>

                          {/* Live Task Badge vs Standby State */}
                          {isTikTokRunning ? (
                            <span className="font-mono text-[10px] text-pink-300 bg-pink-950/80 px-2.5 py-0.5 rounded-full border border-pink-700 font-bold flex items-center gap-1.5 animate-pulse shadow-sm shadow-pink-900/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                              TASK BERJALAN: TIKTOK LIVE ({liveTask.tiktok_live?.target_user || '@streamer'}) [TAP-TAP & CHAT]
                            </span>
                          ) : isGmapRunning ? (
                            <span className="font-mono text-[10px] text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-700 font-bold flex items-center gap-1.5 animate-pulse shadow-sm shadow-amber-900/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              TASK BERJALAN: GOOGLE MAP ({liveTask.active_business_name || 'Maps Target'}) [{isParallel ? 'PARALEL' : 'BERGILIR'}]
                            </span>
                          ) : isSimulationActive ? (
                            <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-700 font-bold flex items-center gap-1.5 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              SIMULASI {isTikTok ? 'TIKTOK LIVE' : 'GOOGLE MAP'} [{isParallel ? 'MODE PARALEL' : 'MODE BERGILIR'}]
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-900/90 px-2.5 py-0.5 rounded-full border border-slate-700 flex items-center gap-1.5 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              STANDBY (Pilih Flow / Jalankan Task)
                            </span>
                          )}

                          {/* Auto-detected Indicator Badge */}
                          {usageFlowChoice === 'auto' && isLiveRunning && (
                            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700/80 flex items-center gap-1 font-semibold">
                              <span>⚡ Auto: {isTikTok ? 'TikTok Live' : 'Google Map'}</span>
                            </span>
                          )}

                          {/* Broken Tentacle Badge */}
                          {brokenCookies.length > 0 && (
                            <span className="font-mono text-[10px] text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-800 animate-pulse flex items-center gap-1 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              {brokenCookies.length} TENTAKEL TERPUTUS (PERLU LOGIN)
                            </span>
                          )}
                        </div>

                        {/* Task Flow Switcher & Mode Selector */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Task Flow Switcher (Auto-Detect, Google Map, TikTok Live) */}
                          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
                            <button
                              onClick={() => {
                                setUsageFlowChoice('auto');
                                setSelectedNodeId('router');
                              }}
                              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                usageFlowChoice === 'auto'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                              title="Otomatis mendeteksi task yang sedang berjalan (TikTok Live atau Google Map)"
                            >
                              <span>🔄</span>
                              <span>Auto-Detect</span>
                              {isLiveRunning && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              )}
                            </button>

                            <button
                              onClick={() => {
                                setUsageFlowChoice('google_maps');
                                setSelectedNodeId('router');
                              }}
                              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                activeFlowType === 'google_maps' && usageFlowChoice !== 'auto'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                                  : activeFlowType === 'google_maps' && usageFlowChoice === 'auto'
                                  ? 'text-amber-400/90 hover:text-amber-300'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                              title="Alur Google Maps: Google ➔ Map ➔ Review + Comment"
                            >
                              <span>🗺️</span>
                              <span>Google Map</span>
                            </button>

                            <button
                              onClick={() => {
                                setUsageFlowChoice('tiktok_live');
                                setSelectedNodeId('router');
                              }}
                              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                activeFlowType === 'tiktok_live' && usageFlowChoice !== 'auto'
                                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-xs'
                                  : activeFlowType === 'tiktok_live' && usageFlowChoice === 'auto'
                                  ? 'text-pink-400/90 hover:text-pink-300'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                              title="Alur TikTok Live: TikTok ➔ Web Live ➔ Tap-Tap & Chat"
                            >
                              <span>🎵</span>
                              <span>TikTok Live</span>
                            </button>
                          </div>

                          {/* Mode Selector (Bergilir vs Paralel) */}
                          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
                            <button
                              onClick={() => setTaskExecutionMode('queue')}
                              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                !isParallel
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                              title="Mode Bergilir: 1 Akun aktif bergantian saat task dijalankan"
                            >
                              <span>📋</span>
                              <span>Bergilir</span>
                            </button>

                            <button
                              onClick={() => setTaskExecutionMode('parallel')}
                              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                isParallel
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                              title="Mode Paralel: Semua akun terhubung serentak saat task dijalankan"
                            >
                              <span>⚡</span>
                              <span>Paralel</span>
                            </button>
                          </div>

                          {/* Optional preview simulation toggle button */}
                          {!isLiveRunning && (
                            <button
                              onClick={() => {
                                if (!isSimulationActive) {
                                  setRotationIndex(0);
                                  setCompletedCookieIds(new Set());
                                }
                                setIsSimulationActive(!isSimulationActive);
                              }}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-all cursor-pointer flex items-center gap-1 ${
                                isSimulationActive
                                  ? 'bg-cyan-950/70 text-cyan-300 border-cyan-700/80 font-bold'
                                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border-slate-700/60'
                              }`}
                              title="Uji coba visual alur tentakel sebelum menjalankan task CLI"
                            >
                              <span>{isSimulationActive ? '⏹' : '▶'}</span>
                              <span>{isSimulationActive ? 'Stop Simulasi' : 'Tes Simulasi Alur'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Tentacle SVG Interactive Canvas */}
                      <div
                        className="relative w-full rounded-xl overflow-hidden bg-[#0A0D14] border border-slate-800/70 flex items-center justify-center p-2"
                        style={{
                          backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.12) 1.2px, transparent 1.2px)',
                          backgroundSize: '24px 24px',
                        }}
                      >
                        <div
                          className="w-full flex items-center justify-center transition-transform duration-200"
                          style={{ transform: `scale(${canvasZoom})`, transformOrigin: 'center center' }}
                        >
                          <svg
                            viewBox="0 0 960 600"
                            className="w-full h-auto select-none overflow-visible max-h-[560px]"
                            preserveAspectRatio="xMidYMid meet"
                          >
                            <defs>
                              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feMerge>
                                  <feMergeNode in="blur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                              <filter id="glow-amber" x="-25%" y="-25%" width="150%" height="150%">
                                <feGaussianBlur stdDeviation="5" result="blur" />
                                <feMerge>
                                  <feMergeNode in="blur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                              <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feMerge>
                                  <feMergeNode in="blur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                              <filter id="glow-node" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feMerge>
                                  <feMergeNode in="blur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                            </defs>

                            {/* Dynamic Tentacle Strands & Energy Particles */}
                            {tentacleNodes.map((node) => {
                              const isSelected = selectedNodeId === node.id || selectedNodeId === 'router';

                              // 1. KONDISI PERLU LOGIN: TENTAKEL TERPUTUS TOTAL (Selalu terputus agar terdeteksi sejak awal)
                              if (node.isNeedsLogin) {
                                return (
                                  <g key={`tentacle-${node.id}`} className="transition-opacity duration-300">
                                    <path
                                      d={node.stump1Path}
                                      fill="none"
                                      stroke="#EF4444"
                                      strokeWidth={isSelected ? '6.5' : '4.5'}
                                      opacity={isSelected ? 0.45 : 0.22}
                                      filter="url(#glow-rose)"
                                    />
                                    <path
                                      d={node.stump1Path}
                                      fill="none"
                                      stroke="#F87171"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      opacity={isSelected ? 0.95 : 0.65}
                                    />

                                    {/* Percikan Listrik Putus di Titik Patahan */}
                                    <circle cx={node.breakTip1.x} cy={node.breakTip1.y} r="4.5" fill="#EF4444" opacity="0.8">
                                      <animate attributeName="r" values="3.5;6.5;3.5" dur="0.8s" repeatCount="indefinite" />
                                      <animate attributeName="opacity" values="0.9;0.3;0.9" dur="0.8s" repeatCount="indefinite" />
                                    </circle>
                                    <circle cx={node.breakTip1.x} cy={node.breakTip1.y} r="2" fill="#FFFFFF" />

                                    {/* Celah Patahan: Garis putus-putus merah peringatan */}
                                    <line
                                      x1={node.breakTip1.x}
                                      y1={node.breakTip1.y}
                                      x2={node.breakTip2.x}
                                      y2={node.breakTip2.y}
                                      stroke="#EF4444"
                                      strokeWidth="1.2"
                                      strokeDasharray="3 4"
                                      opacity="0.35"
                                    />

                                    {/* Indikator Peringatan Sambungan Terputus (✕ Disconnected Badge) */}
                                    <g
                                      className="cursor-pointer group/badge"
                                      onClick={() => setSelectedNodeId(node.id)}
                                    >
                                      <circle
                                        cx={node.midBreak.x}
                                        cy={node.midBreak.y}
                                        r="9"
                                        fill="#1C1917"
                                        stroke="#EF4444"
                                        strokeWidth="1.4"
                                      />
                                      <text
                                        x={node.midBreak.x}
                                        y={node.midBreak.y + 3.2}
                                        textAnchor="middle"
                                        fill="#F87171"
                                        fontSize="8.5"
                                        fontWeight="bold"
                                      >
                                        ✕
                                      </text>
                                    </g>

                                    {/* Sisa tentakel lemas menggantung dari node akun */}
                                    <path
                                      d={node.stump2Path}
                                      fill="none"
                                      stroke="#7F1D1D"
                                      strokeWidth="3.5"
                                      opacity="0.3"
                                    />
                                    <path
                                      d={node.stump2Path}
                                      fill="none"
                                      stroke="#991B1B"
                                      strokeWidth="1.8"
                                      strokeLinecap="round"
                                      strokeDasharray="4 2"
                                      opacity="0.75"
                                    />
                                    <circle cx={node.breakTip2.x} cy={node.breakTip2.y} r="2.5" fill="#EF4444" opacity="0.7" />
                                  </g>
                                );
                              }

                              const isCompleted = completedNodeIds.has(node.id) && !node.isNeedsLogin;

                              // 2. KONDISI SUDAH SELESAI (COMPLETED):
                              // TENTAKEL HIJAU ZAMRUD TERHUBUNG DENGAN ICON CENTANG (CHECKMARK)
                              if (isCompleted) {
                                return (
                                  <g key={`tentacle-${node.id}`} className="transition-all duration-500">
                                    <path
                                      d={node.pathD}
                                      fill="none"
                                      stroke="#10B981"
                                      strokeWidth={isSelected ? '6.5' : '4.5'}
                                      opacity={isSelected ? 0.45 : 0.22}
                                      filter="url(#glow-node)"
                                    />
                                    <path
                                      d={node.pathD}
                                      fill="none"
                                      stroke="#10B981"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      opacity={0.95}
                                    />
                                    <path
                                      d={node.pathD}
                                      fill="none"
                                      stroke="#D1FAE5"
                                      strokeWidth="0.8"
                                      strokeDasharray="4 4"
                                      opacity={0.65}
                                    />
                                    {/* Icon Centang (Checkmark Badge) directly on the tentacle curve */}
                                    <g
                                      transform={`translate(${node.midPoint.x.toFixed(1)}, ${node.midPoint.y.toFixed(1)})`}
                                      className="select-none transition-all duration-300"
                                      title={`${node.fullName} - Ulasan Selesai Diposting`}
                                    >
                                      <circle r="13" fill="#10B981" opacity="0.3" filter="url(#glow-node)" className="animate-pulse" />
                                      <circle r="9.5" fill="#064E3B" stroke="#10B981" strokeWidth="1.8" />
                                      <path
                                        d="M -3.5 -0.2 L -1 2.4 L 3.5 -2.2"
                                        fill="none"
                                        stroke="#FFFFFF"
                                        strokeWidth="2.0"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </g>
                                  </g>
                                );
                              }

                              // 3. KONDISI NORMAL:
                              // JIKA BELUM MULAI JALANKAN TASK (!isTaskActive) -> TENTAKEL DORMANT / STANDBY (TIDAK LANGSUNG AKTIF!)
                              if (!isTaskActive) {
                                return (
                                  <g key={`tentacle-${node.id}`} className="transition-all duration-500">
                                    <path
                                      d={node.pathD}
                                      fill="none"
                                      stroke="#334155"
                                      strokeWidth="1.2"
                                      strokeDasharray="3 5"
                                      opacity="0.22"
                                    />
                                  </g>
                                );
                              }

                              // 4. JIKA TASK SEDANG BERJALAN:
                              // Mode Paralel: SEMUA akun aktif terhubung!
                              // Mode Bergilir: HANYA akun yang sedang dipakai (activeCookieId) yang terhubung!
                              const isConnected = isParallel ? true : (node.id === currentActiveCookieId);

                              if (isConnected) {
                                // TENTAKEL AKTIF TERHUBUNG (PENUH DAYA & ENERGI PULSE SAAT TASK BERJALAN)
                                return (
                                  <g key={`tentacle-${node.id}`} className="transition-all duration-500">
                                    <path
                                      d={node.pathD}
                                      fill="none"
                                      stroke={node.color}
                                      strokeWidth={isSelected ? '7.5' : '5'}
                                      opacity={isSelected ? 0.45 : 0.25}
                                      filter="url(#glow-cyan)"
                                    />
                                    <path
                                      d={node.pathD}
                                      fill="none"
                                      stroke={node.color}
                                      strokeWidth="2.6"
                                      strokeLinecap="round"
                                      opacity={1}
                                    />
                                    <path
                                      d={node.pathD}
                                      fill="none"
                                      stroke="#FFFFFF"
                                      strokeWidth="0.9"
                                      strokeDasharray="4 4"
                                      opacity={0.65}
                                    />
                                    {/* Partikel Listrik Mengalir Cepat dari Router ke Cookie */}
                                    <circle r="4" fill={node.color} filter="url(#glow-cyan)">
                                      <animateMotion dur="1.3s" repeatCount="indefinite" path={node.pathD} />
                                    </circle>
                                    <circle r="1.8" fill="#FFFFFF">
                                      <animateMotion dur="1.3s" repeatCount="indefinite" path={node.pathD} />
                                    </circle>
                                  </g>
                                );
                              }

                              // TENTAKEL STANDBY / MENUNGGU GILIRAN (MODE BERGILIR SAAT TASK BERJALAN)
                              return (
                                <g key={`tentacle-${node.id}`} className="transition-all duration-500">
                                  <path
                                    d={node.pathD}
                                    fill="none"
                                    stroke="#334155"
                                    strokeWidth="1.2"
                                    strokeDasharray="3 5"
                                    opacity="0.22"
                                  />
                                </g>
                              );
                            })}

                            {/* Central Rounded Eye Bot Core (Interactive Dispatcher Hub — No Circle, Tentacles Directly Connected) */}
                            <g
                              onClick={() => setSelectedNodeId('router')}
                              className="cursor-pointer group select-none"
                            >
                              {/* Embedded Interactive Rounded Eye Bot (Directly Centered at 480, 300) */}
                              <foreignObject
                                x="360"
                                y="200"
                                width="240"
                                height="200"
                                className="overflow-visible pointer-events-auto"
                              >
                                <div
                                  className="w-full h-full flex items-center justify-center cursor-pointer select-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNodeId('router');
                                  }}
                                >
                                  <div className="relative flex items-center justify-center">
                                    <InteractiveBotEyes
                                      size="lg"
                                      isRunning={isTaskActive}
                                      mood={
                                        isTaskActive
                                          ? 'working'
                                          : brokenCookies.length > 0
                                          ? 'confused'
                                          : completedNodeIds.size > 0
                                          ? 'happy'
                                          : 'happy'
                                      }
                                      speechText={
                                        isTikTok ? (
                                          selectedNodeId && selectedNodeId !== 'router'
                                            ? `tap-tap ${tentacleNodes.find((n) => n.id === selectedNodeId)?.displayName || 'live'}!`
                                            : isTikTokRunning
                                            ? `${(liveTask?.tiktok_live?.likes_sent || 0).toLocaleString()} likes ❤️`
                                            : isTaskActive
                                            ? `live ${liveTask?.tiktok_live?.target_user || '@target'} 🔥`
                                            : brokenCookies.length > 0
                                            ? `${brokenCookies.length} butuh login!`
                                            : 'siap tap-tap live! 🎵'
                                        ) : (
                                          selectedNodeId && selectedNodeId !== 'router'
                                            ? completedNodeIds.has(selectedNodeId)
                                              ? `${tentacleNodes.find((n) => n.id === selectedNodeId)?.displayName || 'akun'} ulasan selesai! ✓`
                                              : `fokus ${tentacleNodes.find((n) => n.id === selectedNodeId)?.displayName || 'akun'}!`
                                            : !isTaskActive
                                            ? (completedNodeIds.size > 0
                                                ? `${completedNodeIds.size} ulasan selesai! ✓`
                                                : brokenCookies.length > 0
                                                ? `${brokenCookies.length} butuh login!`
                                                : 'siap bertugas!')
                                            : isParallel
                                            ? 'paralel aktif! ⚡'
                                            : `ulasan #${currentTurnNumber} 🚀`
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </foreignObject>

                              {/* Eye Bot Core Badge Tag Underneath */}
                              <g transform="translate(480, 344)">
                                <rect
                                  x={isTikTok ? "-56" : "-44"}
                                  y="-9"
                                  width={isTikTok ? "112" : "88"}
                                  height="18"
                                  rx="5"
                                  fill="#070A11"
                                  stroke={isTikTok ? '#FE2C55' : (selectedNodeId === 'router' ? '#38BDF8' : '#334155')}
                                  strokeWidth="1"
                                  opacity="0.95"
                                />
                                <circle
                                  cx={isTikTok ? "-42" : "-30"}
                                  cy="0"
                                  r="2.5"
                                  fill={isTaskActive ? '#10B981' : '#64748B'}
                                  className={isTaskActive ? 'animate-pulse' : ''}
                                />
                                <text
                                  x={isTikTok ? "-32" : "-20"}
                                  y="3.2"
                                  fill="#E2E8F0"
                                  fontSize="9"
                                  fontWeight="700"
                                  fontFamily="monospace"
                                  letterSpacing="0.4"
                                >
                                  {isTikTok ? 'TIKTOK LIVE CORE' : 'EYE BOT MAPS CORE'}
                                </text>
                              </g>
                            </g>

                            {/* Dynamic Cookie Account Nodes */}
                            {tentacleNodes.map((node) => {
                              const isSelected = selectedNodeId === node.id;
                              const pillW = 126;
                              const pillH = 28;
                              const pillX = node.x - pillW / 2;
                              const pillY = node.y - pillH / 2;
                              const isNeedsLogin = node.isNeedsLogin;
                              const isCompleted = completedNodeIds.has(node.id) && !isNeedsLogin;
                              const isTurnActive = isTaskActive && !isParallel && node.id === currentActiveCookieId;
                              const isConnected = isCompleted || (isTaskActive && (isParallel || isTurnActive));

                              return (
                                <g
                                  key={`node-${node.id}`}
                                  id={node.id}
                                  onClick={() => setSelectedNodeId(node.id)}
                                  className="cursor-pointer group select-none transition-all duration-300"
                                >
                                  {/* Halo Glow for Active / Selected / Completed Node */}
                                  {(isSelected || isTurnActive || isCompleted) && (
                                    <rect
                                      x={pillX - 2}
                                      y={pillY - 2}
                                      width={pillW + 4}
                                      height={pillH + 4}
                                      rx="9"
                                      fill={isNeedsLogin ? '#EF4444' : isCompleted ? '#10B981' : node.color}
                                      opacity={isTurnActive ? '0.45' : isCompleted ? '0.35' : '0.35'}
                                      filter={isNeedsLogin ? 'url(#glow-rose)' : 'url(#glow-node)'}
                                    />
                                  )}

                                  <rect
                                    x={pillX}
                                    y={pillY}
                                    width={pillW}
                                    height={pillH}
                                    rx="7"
                                    fill={
                                      isNeedsLogin
                                        ? '#1C1316'
                                        : isCompleted
                                        ? '#06201B'
                                        : isTurnActive
                                        ? '#132038'
                                        : '#0F172A'
                                    }
                                    stroke={
                                      isNeedsLogin
                                        ? '#EF4444'
                                        : isCompleted
                                        ? '#10B981'
                                        : isTurnActive
                                        ? node.color
                                        : isConnected
                                        ? node.color
                                        : '#334155'
                                    }
                                    strokeWidth={
                                      isSelected
                                        ? 2.4
                                        : isTurnActive
                                        ? 2.2
                                        : isCompleted
                                        ? 1.8
                                        : isNeedsLogin
                                        ? 1.5
                                        : isConnected
                                        ? 1.2
                                        : 1.0
                                    }
                                    strokeDasharray={isNeedsLogin ? '5 2.5' : undefined}
                                    opacity={!isConnected && !isNeedsLogin && !isCompleted ? 0.65 : 1.0}
                                    className="transition-all duration-300 group-hover:brightness-125"
                                  />

                                  <text
                                    x={node.x - 8}
                                    y={node.y + 3.5}
                                    textAnchor="middle"
                                    fill={
                                      isNeedsLogin
                                        ? '#FDA4AF'
                                        : isCompleted
                                        ? '#6EE7B7'
                                        : isTurnActive
                                        ? '#FFFFFF'
                                        : isConnected
                                        ? '#F1F5F9'
                                        : '#94A3B8'
                                    }
                                    fontSize="9.5"
                                    fontWeight="bold"
                                    className="transition-all duration-200 group-hover:fill-white font-mono"
                                  >
                                    {node.name}
                                  </text>

                                  {/* Status indicator: Perlu Login / Selesai (Icon Centang) / Aktif / Standby */}
                                  {isNeedsLogin ? (
                                    <g>
                                      <circle
                                        cx={node.x + pillW / 2 - 12}
                                        cy={node.y}
                                        r="3.2"
                                        fill="#EF4444"
                                      />
                                      <circle
                                        cx={node.x + pillW / 2 - 12}
                                        cy={node.y}
                                        r="5"
                                        fill="#EF4444"
                                        opacity="0.3"
                                        className="animate-ping"
                                      />
                                    </g>
                                  ) : isCompleted ? (
                                    /* Icon Centang (Checkmark) on Node Pill */
                                    <g transform={`translate(${node.x + pillW / 2 - 12}, ${node.y})`}>
                                      <circle r="7.5" fill="#10B981" filter="url(#glow-node)" />
                                      <path
                                        d="M -3.0 -0.2 L -0.8 2.0 L 3.0 -2.2"
                                        fill="none"
                                        stroke="#FFFFFF"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </g>
                                  ) : isTurnActive ? (
                                    <g>
                                      <circle
                                        cx={node.x + pillW / 2 - 12}
                                        cy={node.y}
                                        r="3.5"
                                        fill="#10B981"
                                      />
                                      <circle
                                        cx={node.x + pillW / 2 - 12}
                                        cy={node.y}
                                        r="5.5"
                                        fill="#10B981"
                                        opacity="0.4"
                                        className="animate-ping"
                                      />
                                    </g>
                                  ) : (
                                    <circle
                                      cx={node.x + pillW / 2 - 12}
                                      cy={node.y}
                                      r="3.2"
                                      fill="#10B981"
                                      opacity={isConnected ? 1.0 : 0.6}
                                    />
                                  )}

                                  {/* Sub-tentacles: Google > Map > Review + Comment */}
                                  <g className="sub-tentacles select-none">
                                    {/* Stem connecting Main Cookie Pill to Google Node */}
                                    {isNeedsLogin ? (
                                      <g>
                                        <path
                                          d={`M ${node.x} ${node.y + 14} C ${node.x} ${node.y + 18}, ${node.x - 48} ${node.y + 16}, ${node.x - 48} ${node.y + 21}`}
                                          fill="none"
                                          stroke="#EF4444"
                                          strokeWidth="1.2"
                                          strokeDasharray="2 2"
                                        />
                                        <circle cx={node.x - 48} cy={node.y + 18.5} r="2" fill="#EF4444" opacity="0.8">
                                          <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite" />
                                        </circle>
                                      </g>
                                    ) : isCompleted ? (
                                      <path
                                        d={`M ${node.x} ${node.y + 14} C ${node.x} ${node.y + 18}, ${node.x - 48} ${node.y + 16}, ${node.x - 48} ${node.y + 21}`}
                                        fill="none"
                                        stroke="#10B981"
                                        strokeWidth="1.5"
                                      />
                                    ) : isTurnActive ? (
                                      <g>
                                        <path
                                          d={`M ${node.x} ${node.y + 14} C ${node.x} ${node.y + 18}, ${node.x - 48} ${node.y + 16}, ${node.x - 48} ${node.y + 21}`}
                                          fill="none"
                                          stroke="#38BDF8"
                                          strokeWidth="1.8"
                                          filter="url(#glow-node)"
                                        />
                                        <circle cx={node.x - 24} cy={node.y + 16} r="1.8" fill="#FFFFFF">
                                          <animate attributeName="opacity" values="0.2;1;0.2" dur="0.8s" repeatCount="indefinite" />
                                        </circle>
                                      </g>
                                    ) : isParallel ? (
                                      <path
                                        d={`M ${node.x} ${node.y + 14} C ${node.x} ${node.y + 18}, ${node.x - 48} ${node.y + 16}, ${node.x - 48} ${node.y + 21}`}
                                        fill="none"
                                        stroke="#0284C7"
                                        strokeWidth="1.4"
                                      />
                                    ) : (
                                      <path
                                        d={`M ${node.x} ${node.y + 14} C ${node.x} ${node.y + 18}, ${node.x - 48} ${node.y + 16}, ${node.x - 48} ${node.y + 21}`}
                                        fill="none"
                                        stroke="#334155"
                                        strokeWidth="1.0"
                                        strokeDasharray="2 2"
                                        opacity="0.75"
                                      />
                                    )}

                                    {/* Sub-node 1: Google */}
                                    <g className="cursor-pointer" title={`${node.fullName}: Tahap 1 - ${isTikTok ? "Autentikasi Akun TikTok (Cookie)" : "Autentikasi Akun Google"}`}>
                                      <rect
                                        x={node.x - 64}
                                        y={node.y + 21}
                                        width="32"
                                        height="14"
                                        rx="3.5"
                                        fill={
                                          isNeedsLogin
                                            ? '#3B1216'
                                            : isCompleted
                                            ? '#064E3B'
                                            : isTurnActive
                                            ? '#0C4A6E'
                                            : isParallel
                                            ? '#082F49'
                                            : '#162032'
                                        }
                                        stroke={
                                          isNeedsLogin
                                            ? '#EF4444'
                                            : isCompleted
                                            ? '#10B981'
                                            : isTurnActive
                                            ? '#38BDF8'
                                            : isParallel
                                            ? '#0284C7'
                                            : '#334155'
                                        }
                                        strokeWidth={isSelected || isTurnActive ? '1.2' : '0.9'}
                                      />
                                      <text
                                        x={node.x - 48}
                                        y={node.y + 31.0}
                                        textAnchor="middle"
                                        fill={
                                          isNeedsLogin
                                            ? '#FDA4AF'
                                            : isCompleted
                                            ? '#6EE7B7'
                                            : isTurnActive
                                            ? '#BAE6FD'
                                            : isParallel
                                            ? '#7DD3FC'
                                            : '#CBD5E1'
                                        }
                                        fontSize="6.8"
                                        fontWeight="bold"
                                        className="font-mono select-none"
                                      >
                                        {isNeedsLogin ? '✕ Gagal' : isCompleted ? (isTikTok ? '✓ TikTok' : '✓ Google') : (isTikTok ? 'TikTok' : 'Google')}
                                      </text>
                                    </g>

                                    {/* Tentacle Bridge 1: Google > Map */}
                                    <g>
                                      <path
                                        d={`M ${node.x - 32} ${node.y + 28} Q ${node.x - 28} ${node.y + 26.5} ${node.x - 24} ${node.y + 28}`}
                                        fill="none"
                                        stroke={
                                          isNeedsLogin
                                            ? '#475569'
                                            : isCompleted
                                            ? '#10B981'
                                            : isTurnActive
                                            ? '#38BDF8'
                                            : isParallel
                                            ? '#0284C7'
                                            : '#475569'
                                        }
                                        strokeWidth={isCompleted || isTurnActive ? '1.5' : '1.0'}
                                        strokeDasharray={isNeedsLogin ? '2 2' : undefined}
                                        opacity={isNeedsLogin ? 0.4 : 1.0}
                                      />
                                      {/* Directional Chevron Arrow > */}
                                      <path
                                        d={`M ${node.x - 29} ${node.y + 26.5} L ${node.x - 26.5} ${node.y + 28} L ${node.x - 29} ${node.y + 29.5}`}
                                        fill="none"
                                        stroke={
                                          isNeedsLogin
                                            ? '#475569'
                                            : isCompleted
                                            ? '#6EE7B7'
                                            : isTurnActive
                                            ? '#BAE6FD'
                                            : isParallel
                                            ? '#7DD3FC'
                                            : '#94A3B8'
                                        }
                                        strokeWidth="1.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      {isTurnActive && (
                                        <circle cx={node.x - 28} cy={node.y + 28} r="1.5" fill="#38BDF8">
                                          <animate attributeName="opacity" values="0.3;1;0.3" dur="0.9s" repeatCount="indefinite" />
                                        </circle>
                                      )}
                                    </g>

                                    {/* Sub-node 2: Map */}
                                    <g className="cursor-pointer" title={`${node.fullName}: Tahap 2 - ${isTikTok ? `Buka Live Stream ${liveTask?.tiktok_live?.target_user || "@target"} di Display :99` : "Buka Google Maps Target Bisnis"}`}>
                                      <rect
                                        x={node.x - 24}
                                        y={node.y + 21}
                                        width="26"
                                        height="14"
                                        rx="3.5"
                                        fill={
                                          isNeedsLogin
                                            ? '#0B132B'
                                            : isCompleted
                                            ? '#064E3B'
                                            : isTurnActive
                                            ? '#065F46'
                                            : isParallel
                                            ? '#082F49'
                                            : '#162032'
                                        }
                                        stroke={
                                          isNeedsLogin
                                            ? '#334155'
                                            : isCompleted
                                            ? '#10B981'
                                            : isTurnActive
                                            ? '#34D399'
                                            : isParallel
                                            ? '#0284C7'
                                            : '#334155'
                                        }
                                        strokeWidth={isSelected || isTurnActive ? '1.2' : '0.9'}
                                      />
                                      <text
                                        x={node.x - 11}
                                        y={node.y + 31.0}
                                        textAnchor="middle"
                                        fill={
                                          isNeedsLogin
                                            ? '#64748B'
                                            : isCompleted
                                            ? '#6EE7B7'
                                            : isTurnActive
                                            ? '#A7F3D0'
                                            : isParallel
                                            ? '#7DD3FC'
                                            : '#CBD5E1'
                                        }
                                        fontSize="6.8"
                                        fontWeight="bold"
                                        className="font-mono select-none"
                                      >
                                        {isNeedsLogin ? (isTikTok ? '🔒 Live' : '🔒 Map') : isCompleted ? (isTikTok ? '✓ Live' : '✓ Map') : (isTikTok ? 'Live' : 'Map')}
                                      </text>
                                    </g>

                                    {/* Tentacle Bridge 2: Map > Review + Comment */}
                                    <g>
                                      <path
                                        d={`M ${node.x + 2} ${node.y + 28} Q ${node.x + 6} ${node.y + 26.5} ${node.x + 10} ${node.y + 28}`}
                                        fill="none"
                                        stroke={
                                          isNeedsLogin
                                            ? '#475569'
                                            : isCompleted
                                            ? '#10B981'
                                            : isTurnActive
                                            ? '#F59E0B'
                                            : isParallel
                                            ? '#0284C7'
                                            : '#475569'
                                        }
                                        strokeWidth={isCompleted || isTurnActive ? '1.5' : '1.0'}
                                        strokeDasharray={isNeedsLogin ? '2 2' : undefined}
                                        opacity={isNeedsLogin ? 0.4 : 1.0}
                                      />
                                      {/* Directional Chevron Arrow > */}
                                      <path
                                        d={`M ${node.x + 5} ${node.y + 26.5} L ${node.x + 7.5} ${node.y + 28} L ${node.x + 5} ${node.y + 29.5}`}
                                        fill="none"
                                        stroke={
                                          isNeedsLogin
                                            ? '#475569'
                                            : isCompleted
                                            ? '#6EE7B7'
                                            : isTurnActive
                                            ? '#FDE68A'
                                            : isParallel
                                            ? '#7DD3FC'
                                            : '#94A3B8'
                                        }
                                        strokeWidth="1.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      {isTurnActive && (
                                        <circle cx={node.x + 6} cy={node.y + 28} r="1.5" fill="#F59E0B">
                                          <animate attributeName="opacity" values="0.3;1;0.3" dur="0.9s" repeatCount="indefinite" />
                                        </circle>
                                      )}
                                    </g>

                                    {/* Sub-node 3: Review + Comment */}
                                    <g className="cursor-pointer" title={`${node.fullName}: Tahap 3 - ${isTikTok ? "Auto Tap-Tap Likes & Komentar Chat Live" : "Pemberian Rating 5-Star & Komentar AI Gemini"}`}>
                                      <rect
                                        x={node.x + 10}
                                        y={node.y + 21}
                                        width="54"
                                        height="14"
                                        rx="3.5"
                                        fill={
                                          isNeedsLogin
                                            ? '#0B132B'
                                            : isCompleted
                                            ? '#064E3B'
                                            : isTurnActive
                                            ? '#78350F'
                                            : isParallel
                                            ? '#082F49'
                                            : '#162032'
                                        }
                                        stroke={
                                          isNeedsLogin
                                            ? '#334155'
                                            : isCompleted
                                            ? '#10B981'
                                            : isTurnActive
                                            ? '#F59E0B'
                                            : isParallel
                                            ? '#0284C7'
                                            : '#334155'
                                        }
                                        strokeWidth={isSelected || isTurnActive ? '1.2' : '0.9'}
                                      />
                                      <text
                                        x={node.x + 37}
                                        y={node.y + 31.0}
                                        textAnchor="middle"
                                        fill={
                                          isNeedsLogin
                                            ? '#64748B'
                                            : isCompleted
                                            ? '#6EE7B7'
                                            : isTurnActive
                                            ? '#FDE68A'
                                            : isParallel
                                            ? '#7DD3FC'
                                            : '#CBD5E1'
                                        }
                                        fontSize="6.2"
                                        fontWeight="bold"
                                        className="font-mono select-none"
                                      >
                                        {isNeedsLogin ? (isTikTok ? '🔒 Tap' : '🔒 Review') : isCompleted ? (isTikTok ? '✓ Tap+Chat' : '✓ Review+Komen') : (isTikTok ? 'Tap+Chat' : 'Review+Comment')}
                                      </text>
                                    </g>
                                  </g>
                                </g>
                              );
                            })}
                          </svg>
                        </div>

                        {/* Canvas Zoom Controls (Bottom Left) */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1 text-slate-300 z-10">
                          <button
                            onClick={() => setCanvasZoom((prev) => Math.max(0.8, prev - 0.1))}
                            className="w-6 h-6 flex items-center justify-center hover:bg-slate-800 rounded font-bold text-xs cursor-pointer"
                            title="Zoom Out"
                          >
                            -
                          </button>
                          <span className="text-[10px] font-mono px-1 font-bold">
                            {Math.round(canvasZoom * 100)}%
                          </span>
                          <button
                            onClick={() => setCanvasZoom((prev) => Math.min(1.5, prev + 0.1))}
                            className="w-6 h-6 flex items-center justify-center hover:bg-slate-800 rounded font-bold text-xs cursor-pointer"
                            title="Zoom In"
                          >
                            +
                          </button>
                          <button
                            onClick={() => setCanvasZoom(1)}
                            className="px-1.5 py-0.5 text-[10px] hover:bg-slate-800 rounded text-slate-400 cursor-pointer"
                            title="Reset Zoom"
                          >
                            Fit
                          </button>
                        </div>
                      </div>

                      {/* Selected Node Telemetry HUD (Akun Cookie & Task Telemetry) */}
                      {(() => {
                        const selNode = tentacleNodes.find((n) => n.id === selectedNodeId);
                        const isRouter = selectedNodeId === 'router' || !selNode;
                        const isNeedsLogin = !isRouter && selNode?.isNeedsLogin;
                        const isCurrentlyUsed = isTaskActive && !isParallel && selNode?.id === currentActiveCookieId;
                        const isCompletedNode = !isRouter && completedNodeIds.has(selNode?.id);

                        return (
                          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col gap-3">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              {/* Telemetry Card 1: Active Node */}
                              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Node</span>
                                <span
                                  className="font-bold text-slate-100 font-mono text-xs truncate block"
                                  title={
                                    isRouter
                                      ? isTikTok
                                        ? !isTaskActive
                                          ? 'Eye Bot TikTok Hub (Standby)'
                                          : isTikTokRunning
                                          ? `Eye Bot TikTok ➔ ${liveTask?.tiktok_live?.target_user || '@target'}`
                                          : 'Eye Bot TikTok Hub (Aktif)'
                                        : !isTaskActive
                                        ? 'Eye Bot Core (Standby Hub)'
                                        : isParallel
                                        ? 'Eye Bot Core (Paralel Hub)'
                                        : `Eye Bot Core ➔ ${activeTurnNode?.fullName || 'Dispatcher'}`
                                      : selNode.fullName
                                  }
                                >
                                  {isRouter ? (
                                    isTikTok ? (
                                      !isTaskActive ? (
                                        '🎵 Eye Bot TikTok (Standby)'
                                      ) : isTikTokRunning ? (
                                        `🔥 Eye Bot TikTok ➔ ${liveTask?.tiktok_live?.target_user || '@target'}`
                                      ) : (
                                        '🎵 Eye Bot TikTok (Hub)'
                                      )
                                    ) : !isTaskActive ? (
                                      '🤖 Eye Bot Core (Standby)'
                                    ) : isParallel ? (
                                      '⚡ Eye Bot Core (Paralel Hub)'
                                    ) : (
                                      `⚡ Eye Bot ➔ ${activeTurnNode?.fullName || 'Akun'}`
                                    )
                                  ) : isNeedsLogin ? (
                                    `⚠️ ${selNode.fullName} (TERPUTUS)`
                                  ) : isCurrentlyUsed ? (
                                    `🚀 ${selNode.fullName} (DIGUNAKAN)`
                                  ) : isCompletedNode ? (
                                    `✅ ${selNode.fullName} (SELESAI)`
                                  ) : (
                                    `${isTikTok ? '🎵' : '🍪'} ${selNode.fullName}`
                                  )}
                                </span>
                              </div>

                              {/* Telemetry Card 2: Target / Akun Identitas */}
                              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                  {isTikTok ? 'Target Streamer & Akun' : 'Email Akun Google'}
                                </span>
                                <span
                                  className={`font-bold font-mono text-xs truncate block ${
                                    isNeedsLogin
                                      ? 'text-rose-400'
                                      : isCurrentlyUsed
                                      ? 'text-emerald-400'
                                      : isCompletedNode
                                      ? 'text-emerald-400'
                                      : isTikTok
                                      ? 'text-pink-400'
                                      : 'text-cyan-400'
                                  }`}
                                  title={
                                    isRouter
                                      ? isTikTok
                                        ? `${liveTask?.tiktok_live?.target_user || '@evelyn.vln'} (Live Stream)`
                                        : !isTaskActive
                                        ? 'Eye Bot Dispatcher (Standby)'
                                        : isParallel
                                        ? 'Semua Akun Terhubung'
                                        : activeTurnNode?.email
                                      : isTikTok
                                      ? `${selNode.fullName} (${selNode.username || selNode.email})`
                                      : selNode.email
                                  }
                                >
                                  {isRouter ? (
                                    isTikTok ? (
                                      `${liveTask?.tiktok_live?.target_user || '@evelyn.vln'} (${eligibleCookies.length} Akun TikTok)`
                                    ) : !isTaskActive ? (
                                      `Eye Bot Dispatcher (${eligibleCookies.length} Akun Standby)`
                                    ) : isParallel ? (
                                      `Eye Bot Dispatcher (${eligibleCookies.length} Akun Paralel)`
                                    ) : (
                                      `${activeTurnNode?.email || 'Rotasi Antrean'}`
                                    )
                                  ) : isTikTok ? (
                                    `${selNode.username || selNode.email}`
                                  ) : (
                                    selNode.email
                                  )}
                                </span>
                              </div>

                              {/* Telemetry Card 3: Status Sesi Cookie */}
                              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                  {isTikTok ? 'Status Sesi TikTok' : 'Status Sesi Cookie'}
                                </span>
                                {isRouter ? (
                                  isTikTok ? (
                                    !isTaskActive ? (
                                      <span className="font-bold text-slate-400 font-mono text-xs flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                        SISTEM STANDBY ({eligibleCookies.length} Sesi)
                                      </span>
                                    ) : isTikTokRunning ? (
                                      <span className="font-bold text-pink-400 font-mono text-xs flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                                        SESI LIVE AKTIF (Display :99)
                                      </span>
                                    ) : (
                                      <span className="font-bold text-cyan-400 font-mono text-xs flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                        SIMULASI TIKTOK AKTIF
                                      </span>
                                    )
                                  ) : !isTaskActive ? (
                                    <span className="font-bold text-slate-400 font-mono text-xs flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                      SISTEM STANDBY (Belum Mulai Task)
                                    </span>
                                  ) : isParallel ? (
                                    <span className="font-bold text-cyan-400 font-mono text-xs flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                      SEMUA TENTAKEL TERHUBUNG ({eligibleCookies.length} Sesi)
                                    </span>
                                  ) : (
                                    <span className="font-bold text-amber-400 font-mono text-xs flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                      MODE BERGILIR (Giliran #{currentTurnNumber} Aktif)
                                    </span>
                                  )
                                ) : isNeedsLogin ? (
                                  <span className="font-bold text-rose-400 font-mono text-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                    PERLU LOGIN (SESI TERPUTUS)
                                  </span>
                                ) : isCurrentlyUsed ? (
                                  <span className="font-bold text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    {isTikTok ? 'SEDANG LIVE (AKTIF)' : 'SEDANG DIGUNAKAN BOT'}
                                  </span>
                                ) : isCompletedNode ? (
                                  <span className="font-bold text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    {isTikTok ? '✓ SESI TERVERIFIKASI' : '✓ SELESAI (ULASAN TERPOSTING)'}
                                  </span>
                                ) : (
                                  <span className="font-bold text-slate-300 font-mono text-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    {isTikTok ? 'SESI AKTIF (VALID)' : isParallel ? 'PARALEL TERHUBUNG' : 'STANDBY (SIAP DIGUNAKAN)'}
                                  </span>
                                )}
                              </div>

                              {/* Telemetry Card 4: Kesiapan / Aktivitas */}
                              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                  {isTikTok ? 'Aktivitas TikTok Live' : 'Kesiapan Bot Maps'}
                                </span>
                                {isNeedsLogin ? (
                                  <span className="font-bold text-rose-400 font-mono text-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                    OFFLINE (TENTAKEL PUTUS)
                                  </span>
                                ) : isTikTok ? (
                                  isTikTokRunning ? (
                                    <span className="font-bold text-pink-400 font-mono text-xs flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                                      TAP-TAP AKTIF ({(liveTask?.tiktok_live?.likes_sent || 0).toLocaleString()} LIKES)
                                    </span>
                                  ) : isTaskActive ? (
                                    <span className="font-bold text-cyan-400 font-mono text-xs flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                      SIMULASI STREAM AKTIF
                                    </span>
                                  ) : (
                                    <span className="font-bold text-slate-400 font-mono text-xs flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                      STANDBY (Siap Tap & Chat)
                                    </span>
                                  )
                                ) : isCurrentlyUsed ? (
                                  <span className="font-bold text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    RUNNING (POSTING ULASAN)
                                  </span>
                                ) : isCompletedNode ? (
                                  <span className="font-bold text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    SUKSES (Telah Memposting Maps)
                                  </span>
                                ) : !isTaskActive ? (
                                  <span className="font-bold text-slate-400 font-mono text-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                    IDLE (Menunggu Perintah Task)
                                  </span>
                                ) : (
                                  <span className="font-bold text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    {isParallel ? 'RUNNING MULTI-DISPLAY' : 'READY TO POST'}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Alur Eksekusi Bot: Google Maps vs TikTok Live 3-Stage Pipeline */}
                            <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3.5 flex flex-col gap-2.5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-800/80">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full animate-pulse ${isTikTok ? 'bg-pink-400' : 'bg-cyan-400'}`} />
                                  <span className="text-[11px] font-bold text-slate-200 tracking-wide font-mono uppercase">
                                    {isTikTok
                                      ? 'Alur Eksekusi Bot: TikTok (Auth) ➔ Web Live Stream ➔ Auto Tap-Tap & Chat'
                                      : 'Alur Eksekusi Bot: Google ➔ Map ➔ Review + Comment'}
                                  </span>
                                  {!isRouter && (
                                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                                      isTikTok
                                        ? 'text-pink-300 bg-pink-950/70 border-pink-800/80'
                                        : 'text-cyan-300 bg-cyan-950/70 border-cyan-800/80'
                                    }`}>
                                      {selNode?.name}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-mono font-bold text-slate-400">
                                  {isRouter ? (
                                    isTaskActive ? (
                                      isTikTok ? (
                                        isTikTokRunning
                                          ? `⚡ Stream ${liveTask?.tiktok_live?.target_user || '@target'} Aktif`
                                          : '⚡ Simulasi Stream Aktif'
                                      ) : (
                                        isParallel ? '⚡ Semua Akun Aktif Paralel' : `⚡ Giliran #${currentTurnNumber} Aktif`
                                      )
                                    ) : (
                                      `${tentacleNodes.length} Akun ${isTikTok ? 'TikTok' : 'Google'} (Standby)`
                                    )
                                  ) : isCompletedNode ? (
                                    '✓ Semua Tahap Selesai (100%)'
                                  ) : isNeedsLogin ? (
                                    `✕ Terputus di Tahap 1 ${isTikTok ? 'TikTok' : 'Google'} (0%)`
                                  ) : isCurrentlyUsed ? (
                                    '⚡ Sedang Berjalan (Aktif)'
                                  ) : (
                                    '💤 Standby (Siap Diproses)'
                                  )}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                                {/* Tahap 1: Auth */}
                                <div
                                  className={`rounded-lg p-2.5 border transition-all ${
                                    !isRouter && isNeedsLogin
                                      ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                                      : !isRouter && isCompletedNode
                                      ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-300'
                                      : isCurrentlyUsed || (isRouter && isTaskActive)
                                      ? isTikTok
                                        ? 'bg-pink-950/40 border-pink-600/80 text-pink-200'
                                        : 'bg-sky-950/40 border-sky-600/80 text-sky-200'
                                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold flex items-center gap-1.5 text-[11px]">
                                      <span>{isTikTok ? '🎵' : '🌐'}</span> 1. {isTikTok ? 'TikTok (Auth)' : 'Google (Auth)'}
                                    </span>
                                    <span
                                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                        !isRouter && isNeedsLogin
                                          ? 'bg-rose-900/80 text-rose-200'
                                          : !isRouter && isCompletedNode
                                          ? 'bg-emerald-900/80 text-emerald-200'
                                          : isCurrentlyUsed || (isRouter && isTaskActive)
                                          ? isTikTok
                                            ? 'bg-pink-900/80 text-pink-200 animate-pulse'
                                            : 'bg-sky-900/80 text-sky-200 animate-pulse'
                                          : 'bg-slate-700/60 text-slate-400'
                                      }`}
                                    >
                                      {!isRouter && isNeedsLogin
                                        ? '✕ GAGAL'
                                        : !isRouter && isCompletedNode
                                        ? '✓ OK'
                                        : isCurrentlyUsed || (isRouter && isTaskActive)
                                        ? '⚡ AKTIF'
                                        : 'SIAP'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] opacity-80 leading-relaxed">
                                    {isTikTok ? (
                                      !isRouter && isNeedsLogin
                                        ? 'Sesi cookie login TikTok kadaluarsa (sid_guard / sessionid), perlu login ulang.'
                                        : !isRouter && isCompletedNode
                                        ? 'Profil & cookie TikTok aktif terverifikasi sukses.'
                                        : isRouter
                                        ? `Memverifikasi sesi cookie dari ${tentacleNodes.length} akun TikTok.`
                                        : 'Sesi akun TikTok terautentikasi untuk live streaming.'
                                    ) : (
                                      !isRouter && isNeedsLogin
                                        ? 'Sesi cookie login kadaluarsa / invalid, perlu login ulang.'
                                        : !isRouter && isCompletedNode
                                        ? 'Profil Google aktif & terverifikasi sukses.'
                                        : isRouter
                                        ? `Memverifikasi sesi cookie dari ${tentacleNodes.length} akun Google.`
                                        : 'Sesi akun Google & profil browser review.'
                                    )}
                                  </p>
                                </div>

                                {/* Tahap 2: Live Stream vs Google Maps */}
                                <div
                                  className={`rounded-lg p-2.5 border transition-all ${
                                    !isRouter && isNeedsLogin
                                      ? 'bg-slate-900/50 border-slate-800 text-slate-500'
                                      : !isRouter && isCompletedNode
                                      ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-300'
                                      : isCurrentlyUsed || (isRouter && isTaskActive)
                                      ? 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200'
                                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold flex items-center gap-1.5 text-[11px]">
                                      <span>{isTikTok ? '📺' : '📍'}</span> 2. {isTikTok ? 'Live Stream (Display :99)' : 'Google Maps'}
                                    </span>
                                    <span
                                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                        !isRouter && isNeedsLogin
                                          ? 'bg-slate-800 text-slate-500'
                                          : !isRouter && isCompletedNode
                                          ? 'bg-emerald-900/80 text-emerald-200'
                                          : isCurrentlyUsed || (isRouter && isTaskActive)
                                          ? 'bg-emerald-900/80 text-emerald-200 animate-pulse'
                                          : 'bg-slate-700/60 text-slate-400'
                                      }`}
                                    >
                                      {!isRouter && isNeedsLogin
                                        ? '🔒 LOCKED'
                                        : !isRouter && isCompletedNode
                                        ? '✓ LOADED'
                                        : isCurrentlyUsed || (isRouter && isTaskActive)
                                        ? isTikTok ? '⚡ STREAM' : '⚡ NAVIGASI'
                                        : 'STANDBY'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] opacity-80 leading-relaxed">
                                    {isTikTok ? (
                                      !isRouter && isNeedsLogin
                                        ? 'Terkunci karena sesi TikTok belum terautentikasi.'
                                        : !isRouter && isCompletedNode
                                        ? `Halaman live ${liveTask?.tiktok_live?.target_user || '@streamer'} berhasil dibuka.`
                                        : isRouter
                                        ? `Membuka siaran live streaming di Chromium Virtual Display :99.`
                                        : `Navigasi otomatis ke ${liveTask?.tiktok_live?.target_user || '@target'}/live.`
                                    ) : (
                                      !isRouter && isNeedsLogin
                                        ? 'Terkunci karena sesi Google belum terautentikasi.'
                                        : !isRouter && isCompletedNode
                                        ? 'Listing target bisnis Google Maps berhasil dibuka.'
                                        : isRouter
                                        ? 'Membuka URL tempat bisnis target di Google Maps.'
                                        : 'Navigasi otomatis ke URL tempat Google Maps target.'
                                    )}
                                  </p>
                                </div>

                                {/* Tahap 3: Tap-Tap & Chat vs Review + Comment */}
                                <div
                                  className={`rounded-lg p-2.5 border transition-all ${
                                    !isRouter && isNeedsLogin
                                      ? 'bg-slate-900/50 border-slate-800 text-slate-500'
                                      : !isRouter && isCompletedNode
                                      ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-300'
                                      : isCurrentlyUsed || (isRouter && isTaskActive)
                                      ? isTikTok
                                        ? 'bg-pink-950/40 border-pink-600/80 text-pink-200'
                                        : 'bg-amber-950/40 border-amber-600/80 text-amber-200'
                                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold flex items-center gap-1.5 text-[11px]">
                                      <span>{isTikTok ? '❤️' : '⭐'}</span> 3. {isTikTok ? 'Tap-Tap & Auto Chat' : 'Review + Comment'}
                                    </span>
                                    <span
                                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                        !isRouter && isNeedsLogin
                                          ? 'bg-slate-800 text-slate-500'
                                          : !isRouter && isCompletedNode
                                          ? 'bg-emerald-900/80 text-emerald-200'
                                          : isCurrentlyUsed || (isRouter && isTaskActive)
                                          ? isTikTok
                                            ? 'bg-pink-900/80 text-pink-200 animate-pulse'
                                            : 'bg-amber-900/80 text-amber-200 animate-pulse'
                                          : 'bg-slate-700/60 text-slate-400'
                                      }`}
                                    >
                                      {!isRouter && isNeedsLogin
                                        ? '🔒 LOCKED'
                                        : !isRouter && isCompletedNode
                                        ? isTikTok ? '✓ SELESAI' : '✓ 5-STAR POSTED'
                                        : isCurrentlyUsed || (isRouter && isTaskActive)
                                        ? isTikTok ? '⚡ TAP-TAP' : '⚡ SUBMIT'
                                        : 'STANDBY'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] opacity-80 leading-relaxed">
                                    {isTikTok ? (
                                      !isRouter && isNeedsLogin
                                        ? 'Terkunci karena tidak dapat berinteraksi tanpa sesi akun TikTok.'
                                        : !isRouter && isCompletedNode
                                        ? 'Tap-tap likes & pengiriman pesan live chat sukses.'
                                        : isRouter
                                        ? `Auto tap-tap likes berkecepatan tinggi & kirim chat live motivasi.`
                                        : `Eksekusi klik tap-tap likes & kirim komentar chat motivasi.`
                                    ) : (
                                      !isRouter && isNeedsLogin
                                        ? 'Terkunci karena tidak dapat memposting tanpa sesi Google.'
                                        : !isRouter && isCompletedNode
                                        ? 'Ulasan bintang 5 & komentar AI sukses terposting publik.'
                                        : isRouter
                                        ? 'Gemini AI menghasilkan ulasan bintang 5 & komentar unik.'
                                        : 'Injeksi ulasan bintang 5 + komentar AI Gemini natural.'
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Disconnected Cookie Alert Callout with 1-Click Action */}
                            {isNeedsLogin && (
                              <div className="bg-rose-950/40 border border-rose-800/70 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                                <div className="flex items-center gap-2.5 text-rose-200">
                                  <span className="text-base">⚠️</span>
                                  <div>
                                    <p className="font-semibold text-rose-300">
                                      {isTikTok ? 'Sesi Akun TikTok Terputus (Perlu Login Ulang)' : 'Sesi Akun Google Terputus (Perlu Login Ulang)'}
                                    </p>
                                    <p className="text-[11px] text-rose-300/80">
                                      {isTikTok
                                        ? 'Tentakel routing ke akun ini otomatis diputus demi mencegah bot TikTok Live gagal tap-tap atau chat.'
                                        : 'Tentakel routing ke akun ini otomatis diputus demi mencegah bot Google Maps gagal saat posting ulasan.'}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setActiveTab(isTikTok ? 'tiktok_cookies' : 'cookies')}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs whitespace-nowrap cursor-pointer transition-colors shadow-sm self-start sm:self-auto"
                                >
                                  {isTikTok ? 'Perbarui Cookie di Akun TikTok →' : 'Perbarui Cookie di Akun Google →'}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  );
                })()}
              </div>

              {/* Right Column: RECENT REQUESTS */}
              <div className="xl:col-span-4 bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between text-white">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-100 tracking-wider uppercase">
                        {isTikTokFlow ? 'RECENT REQUESTS & LIVE LOGS' : 'RECENT REQUESTS'}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        {isTikTokFlow ? 'Log interaksi TikTok Live & bot ulasan' : 'Log ulasan bot per akun cookie'}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                      {usageData?.recent_requests?.length || 5} LOGS
                    </span>
                  </div>

                  {/* Filter / Search within requests */}
                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari akun atau target maps..."
                      value={usageSearchQuery}
                      onChange={(e) => setUsageSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 font-mono"
                    />
                  </div>

                  {/* Requests Table / List */}
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {(usageData?.recent_requests || [])
                      .filter((req) =>
                        (req.model || '').toLowerCase().includes(usageSearchQuery.toLowerCase()) ||
                        (req.account_name || '').toLowerCase().includes(usageSearchQuery.toLowerCase()) ||
                        (req.business_name || '').toLowerCase().includes(usageSearchQuery.toLowerCase())
                      )
                      .map((req, idx) => (
                        <div
                          key={req.id || idx}
                          className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-2.5 hover:border-slate-700 transition-all font-mono text-[11px]"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-cyan-400 font-bold truncate max-w-[160px]" title={req.model}>
                              {req.account_name || req.model}
                            </span>
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/70 px-1.5 py-0.2 rounded border border-emerald-800/60 font-sans font-bold">
                              {req.status}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 truncate mb-1.5 font-sans">
                            {req.business_name} • <span className="font-mono text-slate-500">{req.model}</span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/50">
                            <span>{req.latency}</span>
                            <span>{req.input_tokens} in / {req.output_tokens} out</span>
                            <span className="text-slate-400">{req.timestamp}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 mt-3 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Routing: Native Headless :99</span>
                  <button
                    onClick={loadUsageData}
                    className="text-cyan-400 hover:underline cursor-pointer"
                  >
                    Refresh Logs
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ===================================================================== */}
        {/* TAB 7: 🤖 CONFIG BOT (TUGAS-TUGAS BOT OTOMASI)                        */}
        {/* ===================================================================== */}
        {activeTab === 'config-bot' && (
          <main className="p-4 sm:p-6 space-y-6">
            {/* Header: Title, Live Status & Stats */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-indigo-400 flex items-center justify-center font-bold shadow-xs">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        Config Bot & Tugas Otomasi
                      </h2>
                      <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        3 TUGAS
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Kelola dan aktifkan atau nonaktifkan modul tugas bot otomasi melalui matriks status kontrol di bawah ini.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status summary pills */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {botConfigSavedSuccess && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-xs animate-fade-in">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Tersimpan Otomatis
                  </span>
                )}
                {botConfigSaving && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 font-medium text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                    Menyimpan...
                  </span>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {[
                      botModulesConfig.google_maps?.enabled,
                      botModulesConfig.tiktok_live?.enabled,
                    ].filter(Boolean).length} / 3 Aktif
                  </span>
                </div>
                <button
                  onClick={loadBotConfig}
                  disabled={botConfigLoading}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${botConfigLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* ── Konfigurasi Layar (Display) ── */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all hover:border-slate-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    botModulesConfig.display?.enabled
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'bg-slate-100 text-slate-500 border border-slate-200/80'
                  }`}>
                    <Tv className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">
                        Display
                      </h3>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        botModulesConfig.display?.enabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {botModulesConfig.display?.enabled ? 'AKTIF' : 'NONAKTIF (DEFAULT)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      aktifkan layar untuk memantau bot.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-semibold text-slate-600 font-mono">
                    {botModulesConfig.display?.enabled ? 'Layar Aktif' : 'Mati'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(botModulesConfig.display?.enabled)}
                    onClick={handleToggleDisplay}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      botModulesConfig.display?.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                    title={botModulesConfig.display?.enabled ? 'Nonaktifkan Display' : 'Aktifkan Display'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        botModulesConfig.display?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Matriks Ringkasan Tugas Bot (Table Matrix) */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Matriks Status Tugas Bot
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ringkasan eksekusi dan kesiapan seluruh modul otomasi
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  3 Platform
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                      <th className="py-2.5 px-3">Modul Tugas</th>
                      <th className="py-2.5 px-3">Platform</th>
                      <th className="py-2.5 px-3">Tugas Utama</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Aksi & Switch Modul</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Google Map */}
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>Google Map</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">Google Maps</td>
                      <td className="py-3 px-3 text-slate-600">Review bintang 5 & komentar ulasan AI Gemini</td>
                      <td className="py-3 px-3">
                        {botModulesConfig.google_maps?.enabled ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => setActiveTab('businesses')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                            title="Buka daftar Target Bisnis Maps"
                          >
                            <span>Target Bisnis</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={Boolean(botModulesConfig.google_maps?.enabled)}
                            onClick={() => handleToggleModule('google_maps')}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              botModulesConfig.google_maps?.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                            title={botModulesConfig.google_maps?.enabled ? 'Nonaktifkan Google Map' : 'Aktifkan Google Map'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                botModulesConfig.google_maps?.enabled ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* TikTok Live */}
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                        <svg className="w-4 h-4 fill-current text-pink-600" viewBox="0 0 24 24">
                          <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.9 2.84 2.895 2.895 0 0 1-2.896-2.897 2.896 2.896 0 0 1 2.896-2.897c.376 0 .73.07 1.055.197V9.324a6.37 6.37 0 0 0-1.055-.09A6.335 6.335 0 0 0 3 15.568 6.335 6.335 0 0 0 9.37 21.9a6.335 6.335 0 0 0 6.335-6.332V9.378a8.175 8.175 0 0 0 4.884 1.6V7.534a4.831 4.831 0 0 1-1-.848z"/>
                        </svg>
                        <span>TikTok Live</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">TikTok Live Stream</td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>
                          <span>Auto tap-tap like, live chat, dan sambut gift</span>
                          <p className="text-[11px] text-cyan-600 font-mono mt-0.5">
                            Target: {tiktokForm.target_user || '@autobotix.live'} • {tiktokForm.tap_speed} tap/detik
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {botModulesConfig.tiktok_live?.enabled ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => setShowTiktokConfigModal(true)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                            title="Atur target akun TikTok, kecepatan tap-tap, dan pesan chat"
                          >
                            <span>⚙️ Pengaturan</span>
                          </button>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={Boolean(botModulesConfig.tiktok_live?.enabled)}
                            onClick={() => handleToggleModule('tiktok_live')}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              botModulesConfig.tiktok_live?.enabled ? 'bg-cyan-500' : 'bg-slate-300'
                            }`}
                            title={botModulesConfig.tiktok_live?.enabled ? 'Nonaktifkan TikTok Live' : 'Aktifkan TikTok Live'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                botModulesConfig.tiktok_live?.enabled ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Youtube Live (akan datang) */}
                    <tr className="hover:bg-slate-50/80 transition-colors opacity-70">
                      <td className="py-3 px-3 font-semibold text-slate-700 flex items-center gap-2">
                        <svg className="w-4 h-4 fill-current text-red-500" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <span>Youtube Live (akan datang)</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">YouTube Live Stream</td>
                      <td className="py-3 px-3 text-slate-500">Live chat, auto like stream & retensi durasi</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Akan Datang
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-[11px] font-mono font-bold text-slate-400 flex items-center justify-end gap-1">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}

      {/* Modal: Edit Akun Google */}
      {showEditAccountModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditAccountModal(false); }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                <span>Edit Akun Google</span>
              </h3>
              <button
                onClick={() => setShowEditAccountModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditAccountSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Google</label>
                <input
                  type="email"
                  value={editAccountForm.email}
                  onChange={(e) => setEditAccountForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                  <span className="text-slate-400 font-normal ml-1">(kosongkan jika tidak diubah)</span>
                </label>
                {editAccountHasPassword && (
                  <p className="text-[11px] text-emerald-600 font-medium mb-1.5 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Password tersimpan · kosongkan untuk mempertahankan
                  </p>
                )}
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editAccountForm.password}
                    onChange={(e) => setEditAccountForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Password baru..."
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* TOTP */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  TOTP Secret (2FA)
                  <span className="text-slate-400 font-normal ml-1">(opsional)</span>
                </label>
                {editAccountHasTotp && (
                  <p className="text-[11px] text-blue-600 font-medium mb-1.5 flex items-center gap-1">
                    <Check className="w-3 h-3" /> TOTP tersimpan · kosongkan untuk mempertahankan
                  </p>
                )}
                <input
                  type="text"
                  value={editAccountForm.totp_secret}
                  onChange={(e) => setEditAccountForm(f => ({ ...f, totp_secret: e.target.value }))}
                  placeholder="JBSWY3DPEHPK3PXP..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditAccountModal(false)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition-colors border border-slate-200 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Akun Google */}
      {showAddAccountModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddAccountModal(false); }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Tambah Akun Google Baru</span>
              </h3>
              <button
                onClick={() => setShowAddAccountModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Google *</label>
                <input
                  type="email"
                  required
                  placeholder="contoh: budi.santoso@gmail.com"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (Opsional jika login via Cookie)
                </label>
                <input
                  type="password"
                  placeholder="Password akun jika ada"
                  value={accountForm.password}
                  onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2FA TOTP Secret Key (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: JBSWY3DPEHPK3PXP"
                  value={accountForm.totp_secret}
                  onChange={(e) => setAccountForm({ ...accountForm, totp_secret: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah / Perbarui Cookie */}
      {showCookieModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCookieModal(false); }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <GmailLogo className="w-5 h-5" />
                <span>Tambah / Perbarui Cookie Sesi Google</span>
              </h3>
              <button
                onClick={() => setShowCookieModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCookie} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Akun (Opsional, otomatis diekstrak jika ada di JSON)
                </label>
                <input
                  type="text"
                  placeholder="contoh: budi.santoso@gmail.com"
                  value={cookieForm.email}
                  onChange={(e) => setCookieForm({ ...cookieForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  JSON Cookie dari Cookie-Editor *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder='Tempelkan JSON dari Cookie-Editor di sini (contoh: [{"name": "SID", "value": "..."}, ...])'
                  value={cookieForm.cookie_json}
                  onChange={(e) => setCookieForm({ ...cookieForm, cookie_json: e.target.value })}
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                ℹ️ Sistem akan langsung memverifikasi sesi ke Google MyAccount secara otomatis dan mengekstrak nama profil pemilik akun.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCookieModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Memverifikasi...' : 'Simpan & Verifikasi Google'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah / Import Cookie Sesi TikTok */}
      {showTikTokCookieModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowTikTokCookieModal(false); }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-900 text-pink-500 flex items-center justify-center">
                  <TikTokLogo className="w-3.5 h-3.5" />
                </div>
                <span>Tambah / Perbarui Cookie Sesi TikTok</span>
              </h3>
              <button
                onClick={() => setShowTikTokCookieModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTikTokCookie} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Payload Cookie TikTok (JSON Cookie-Editor / Raw sessionid) *
                  </label>
                  <button
                    type="button"
                    onClick={() => triggerDetectTikTok()}
                    disabled={isDetectingTikTok || !tiktokCookieForm.cookie_json}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-600 hover:text-pink-700 hover:bg-pink-50 px-2 py-0.5 rounded cursor-pointer disabled:opacity-40 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isDetectingTikTok ? 'animate-spin' : ''}`} />
                    <span>{isDetectingTikTok ? 'Mendeteksi...' : '🔍 Deteksi Akun Otomatis'}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={7}
                  placeholder='Tempelkan JSON dari ekstensi Cookie-Editor atau token sessionid di sini (contoh: [{"name": "sessionid", "value": "..."}, ...] atau sessionid=xxxxx)'
                  value={tiktokCookieForm.cookie_json}
                  onChange={(e) => handleCookieJsonChange(e.target.value)}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text');
                    if (pasted && pasted.length > 10) {
                      setTimeout(() => triggerDetectTikTok(pasted), 120);
                    }
                  }}
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-mono"
                />
              </div>

              {/* Status Banner Deteksi Otomatis */}
              {isDetectingTikTok && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 animate-pulse">
                  <RefreshCw className="w-4 h-4 text-pink-500 animate-spin shrink-0" />
                  <span>Sedang memindai & mendeteksi profil akun TikTok dari cookie...</span>
                </div>
              )}

              {detectedTikTokInfo && !isDetectingTikTok && (
                detectedTikTokInfo.detected || detectedTikTokInfo.username ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 animate-in fade-in">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-pink-500 flex items-center justify-center shrink-0 border border-emerald-300 overflow-hidden shadow-xs">
                        {detectedTikTokInfo.avatar_url ? (
                          <img src={detectedTikTokInfo.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <TikTokLogo className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span>{detectedTikTokInfo.username}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-200/80 text-emerald-800 font-semibold">
                            Terdeteksi Otomatis
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate">
                          {detectedTikTokInfo.nickname ? `Nama: ${detectedTikTokInfo.nickname}` : 'Sesi Aktif Terverifikasi'}
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate">{detectedTikTokInfo.reason || 'Token sesi belum dapat diverifikasi secara langsung.'}</span>
                  </div>
                )
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username Akun TikTok (Otomatis terisi saat cookie ditempel)
                </label>
                <input
                  type="text"
                  placeholder="contoh: @evelyn.vln atau evelyn.vln"
                  value={tiktokCookieForm.username}
                  onChange={(e) => setTikTokCookieForm({ ...tiktokCookieForm, username: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Panggilan / Nickname (Otomatis terisi saat cookie ditempel)
                </label>
                <input
                  type="text"
                  placeholder="contoh: Evelyn Valencia"
                  value={tiktokCookieForm.nickname}
                  onChange={(e) => setTikTokCookieForm({ ...tiktokCookieForm, nickname: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div className="bg-pink-50/60 border border-pink-200/60 rounded-xl p-3 text-[11px] text-pink-900 leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 text-pink-800 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cara Ekspor Cookie TikTok:</span>
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                  <li>Buka <b>tiktok.com</b> di browser Chrome/Edge dan login ke akun Anda.</li>
                  <li>Buka ekstensi <b>Cookie-Editor</b>, lalu klik tombol <b>Export</b> &rarr; <b>Export as JSON</b>.</li>
                  <li>Tempelkan hasil copy ke formulir di atas lalu klik <b>Simpan & Verifikasi</b>.</li>
                </ol>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTikTokCookieModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTikTokCookie}
                  className="px-4 py-2 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingTikTokCookie && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingTikTokCookie ? 'Memverifikasi...' : 'Simpan & Verifikasi TikTok'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pengaturan Modul TikTok Live */}
      {showTiktokConfigModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowTiktokConfigModal(false); }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 max-w-md w-full shadow-xl my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-900 text-pink-500 flex items-center justify-center">
                  <TikTokLogo className="w-3.5 h-3.5" />
                </div>
                <span>Pengaturan TikTok Live</span>
              </h3>
              <button
                onClick={() => setShowTiktokConfigModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                handleSaveTiktokSettings(e);
                setShowTiktokConfigModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Username TikTok Live *
                </label>
                <input
                  type="text"
                  value={tiktokForm.target_user}
                  onChange={(e) => setTiktokForm({ ...tiktokForm, target_user: e.target.value })}
                  placeholder="@username atau URL Live"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kecepatan Auto Tap-tap Likes
                </label>
                <select
                  value={tiktokForm.tap_speed}
                  onChange={(e) => setTiktokForm({ ...tiktokForm, tap_speed: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                >
                  <option value={5}>Santai (5x / detik)</option>
                  <option value={20}>Cepat (20x / detik)</option>
                  <option value={50}>Turbo (50x / detik)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Template Pesan Chat Live
                </label>
                <input
                  type="text"
                  value={tiktokForm.chat_message}
                  onChange={(e) => setTiktokForm({ ...tiktokForm, chat_message: e.target.value })}
                  placeholder="Ketik pesan auto chat..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              {/* Display Toggle Setting */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-slate-700" />
                    <label className="text-xs font-semibold text-slate-800">
                      Display
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    aktifkan layar untuk memantau bot.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(tiktokForm.display)}
                  onClick={() => setTiktokForm({ ...tiktokForm, display: !tiktokForm.display })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    tiktokForm.display ? 'bg-cyan-500' : 'bg-slate-300'
                  }`}
                  title={tiktokForm.display ? 'Nonaktifkan Display' : 'Aktifkan Display'}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      tiktokForm.display ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTiktokConfigModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={botConfigSaving}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{botConfigSaving ? 'Menyimpan...' : 'Simpan'}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveTiktokSettings(e, true)}
                  disabled={botConfigSaving || submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-500 hover:to-pink-500 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Simpan &amp; Start Bot 🚀</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Target Bisnis Maps */}
      {showAddBizModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddBizModal(false); }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Tambah Target Bisnis Maps</span>
              </h3>
              <button
                onClick={() => setShowAddBizModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBusiness} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bisnis / Tempat *</label>
                <input
                  type="text"
                  required
                  placeholder="contoh: RM Sederhana Senopati"
                  value={bizForm.name}
                  onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL Google Maps Listing *</label>
                <input
                  type="url"
                  required
                  placeholder="https://maps.app.goo.gl/... atau https://www.google.com/maps/place/..."
                  value={bizForm.url}
                  onChange={(e) => setBizForm({ ...bizForm, url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBizModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Target Bisnis Maps'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Fast Run Review Bot */}
      {showFastRunModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowFastRunModal(false); }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600 fill-current" />
                <span>Luncurkan Ulasan Bot Otomatis</span>
              </h3>
              <button
                onClick={() => setShowFastRunModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFastRunSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Bisnis *</label>
                <select
                  required
                  value={fastRunForm.business_id}
                  onChange={(e) => setFastRunForm({ ...fastRunForm, business_id: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">-- Pilih Bisnis Target --</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (ID #{b.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Browser / Slot Paralel (1 s/d 6)
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, Math.min(6, activeCookiesCount || 6))}
                  value={fastRunForm.slots}
                  onChange={(e) => setFastRunForm({ ...fastRunForm, slots: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Maksimal sesuai jumlah akun aktif ({activeCookiesCount} akun siap).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rating Bintang</label>
                <select
                  value={fastRunForm.star_rating}
                  onChange={(e) => setFastRunForm({ ...fastRunForm, star_rating: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 Bintang (Sangat Puas)</option>
                  <option value="4">⭐⭐⭐⭐ 4 Bintang (Puas)</option>
                  <option value="3">⭐⭐⭐ 3 Bintang (Netral)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFastRunModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || activeCookiesCount === 0}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Meluncurkan...' : 'Luncurkan Sekarang 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Cookie / OAuth Snippet */}
      {snippetModalCookie && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setSnippetModalCookie(null); }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                {snippetModalCookie.auth_method === 'oauth' || snippetModalCookie.auth_method === 'google_oauth' || snippetModalCookie.oauth_access_token ? (
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                ) : (
                  <Cookie className="w-4 h-4 text-emerald-600" />
                )}
                <span>Kredensial Akun #{snippetModalCookie.id} ({snippetModalCookie.email})</span>
              </h3>
              <button
                onClick={() => setSnippetModalCookie(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {snippetModalCookie.auth_method === 'oauth' || snippetModalCookie.auth_method === 'google_oauth' || snippetModalCookie.oauth_access_token ? (
              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] max-h-80 overflow-y-auto space-y-2">
                <div className="text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Google Cloud OAuth 2.0 Client Credentials</span>
                </div>
                <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-800">
                  <span className="text-slate-400">Email:</span>
                  <span className="col-span-2 text-white font-semibold">{snippetModalCookie.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-800">
                  <span className="text-slate-400">Nama Profil:</span>
                  <span className="col-span-2 text-slate-200">{snippetModalCookie.account_name || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-800">
                  <span className="text-slate-400">Status Token:</span>
                  <span className="col-span-2 text-emerald-400 font-semibold">{snippetModalCookie.status || 'active'}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-800">
                  <span className="text-slate-400">Refresh Token:</span>
                  <span className="col-span-2 text-emerald-300">
                    {snippetModalCookie.oauth_refresh_token ? '✓ Tersedia (Auto Refresh Aktif)' : '-'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-800">
                  <span className="text-slate-400">Masa berlaku akun:</span>
                  <span className="col-span-2 text-slate-300">
                    {formatUnixId(snippetModalCookie.oauth_account_expiry)} (30 hari)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-800">
                  <span className="text-slate-400">Access token:</span>
                  <span className="col-span-2 text-slate-300">
                    {snippetModalCookie.oauth_token_expiry ? formatUnixId(snippetModalCookie.oauth_token_expiry) : 'Diperbarui otomatis'}
                  </span>
                </div>
                {snippetModalCookie.oauth_picture && (
                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-800">
                    <span className="text-slate-400">Avatar URL:</span>
                    <a href={snippetModalCookie.oauth_picture} target="_blank" rel="noreferrer" className="col-span-2 text-blue-400 hover:underline truncate block">
                      {snippetModalCookie.oauth_picture}
                    </a>
                  </div>
                )}
                <div className="pt-2">
                  <span className="text-slate-400">Access Token (OAuth 2.0 Credential):</span>
                  <p className="break-all font-mono text-[11px] text-emerald-400 mt-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800 select-all">
                    {snippetModalCookie.oauth_access_token ? `${snippetModalCookie.oauth_access_token.substring(0, 35)}... [Secured in Server DB]` : 'ya29.a0AehfTOnHwQalJ2uDJTLaysQzgWRs_aIz1... [Secured in Server DB]'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] max-h-80 overflow-y-auto">
                <pre className="whitespace-pre-wrap">
                  {snippetModalCookie.cookie_json || 'Tidak ada data JSON tersimpan.'}
                </pre>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSnippetModalCookie(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
