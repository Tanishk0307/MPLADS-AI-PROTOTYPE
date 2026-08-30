import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ThumbsUp,
  MapPin,
  ShieldCheck,
  Building2,
  User as UserIcon,
  Sparkles,
  X,
  ChevronRight,
  Filter,
  Eye,
  Award,
  RefreshCw,
  Video,
  VideoOff,
  SwitchCamera,
  Crosshair,
  Radio,
} from 'lucide-react';
import type { Project, CitizenProofReport, User } from '@/types/database';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

interface CitizenProofSectionProps {
  projects: Project[];
  proofs: CitizenProofReport[];
  onAddProof: (proof: Omit<CitizenProofReport, 'id' | 'submittedAt' | 'upvotes' | 'verifiedByCdo'>) => void;
  onUpvoteProof: (proofId: string) => void;
  onVerifyProof?: (proofId: string) => void;
  onSelectProject: (projectId: string) => void;
  user: User | null;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    label: 'Road Construction Proof',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f8?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Open Drainage / Pit Proof',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'School Building Proof',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Street Infrastructure Proof',
    url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
  },
];

export function CitizenProofSection({
  projects,
  proofs,
  onAddProof,
  onUpvoteProof,
  onVerifyProof,
  onSelectProject,
  user,
}: CitizenProofSectionProps) {
  const { t, isHindi } = useLanguage();

  const statusBadgeConfig: Record<string, { label: string; bg: string }> = {
    on_track: { label: isHindi ? 'कार्य प्रगति पर' : 'Work on Track', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    stalled: { label: isHindi ? 'कार्य रुका हुआ / ठप' : 'Stalled / Abandoned', bg: 'bg-red-100 text-red-800 border-red-300' },
    slow: { label: isHindi ? 'धीमी गति' : 'Slow Execution', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
    poor_quality: { label: isHindi ? 'घटिया सामग्री' : 'Substandard Material', bg: 'bg-rose-100 text-rose-800 border-rose-300' },
    completed: { label: isHindi ? 'धरातल पर पूर्ण' : 'Ground Completed', bg: 'bg-blue-100 text-blue-800 border-blue-300' },
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'STALLED' | 'VERIFIED' | 'DISCREPANCY'>('ALL');

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id ?? '');
  const [citizenName, setCitizenName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageUrl, setImageUrl] = useState(SAMPLE_PHOTO_PRESETS[0].url);
  const [progressPercentage, setProgressPercentage] = useState<number>(35);
  const [workStatus, setWorkStatus] = useState<CitizenProofReport['workStatus']>('slow');
  const [locationRemarks, setLocationRemarks] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Live Camera Capture States
  const [photoSource, setPhotoSource] = useState<'live_camera' | 'upload_file'>('live_camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedLivePhoto, setCapturedLivePhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [liveGps, setLiveGps] = useState<{ lat: number; lng: number } | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const canVerifyProof =
    user?.role === 'MP' ||
    user?.role === 'SNA' ||
    user?.role === 'Ministry' ||
    user?.role === 'DM' ||
    user?.role === 'CDO';

  // Stop camera media tracks helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Start live webcam / mobile camera feed
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    // Try fetching GPS coordinates
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLiveGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          const selectedProj = projects.find((p) => p.id === selectedProjectId);
          setLiveGps({
            lat: selectedProj?.latitude ?? 28.6692,
            lng: selectedProj?.longitude ?? 77.4538,
          });
        },
        { enableHighAccuracy: true, timeout: 4000 }
      );
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device API is not supported on this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to access camera. Please allow camera permissions.';
      setCameraError(msg);
      setCameraActive(false);
    }
  }, [facingMode, projects, selectedProjectId, stopCamera]);

  // Flip camera (front <-> rear)
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Launch camera automatically when modal opens with Live Camera mode
  useEffect(() => {
    if (modalOpen && photoSource === 'live_camera' && !capturedLivePhoto) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [modalOpen, photoSource, capturedLivePhoto, startCamera, stopCamera]);

  // Capture frame from Live Video stream
  const captureLivePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsSnapping(true);

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, width, height);

    // Draw official GPS watermark & timestamp overlay bar
    const selectedProj = projects.find((p) => p.id === selectedProjectId);
    const lat = liveGps?.lat ?? selectedProj?.latitude ?? 28.6692;
    const lng = liveGps?.lng ?? selectedProj?.longitude ?? 77.4538;
    const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.fillRect(0, height - 52, width, 52);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`● LIVE FIELD VERIFICATION · GHAZIABAD DISTRICT`, 14, height - 32);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '11px monospace';
    ctx.fillText(`📍 GPS: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E | ⏰ IST: ${dateStr}`, 14, height - 14);

    const base64Data = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedLivePhoto(base64Data);
    setImageUrl(base64Data);
    stopCamera();

    // Upload live image to backend
    setUploadingFile(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      if (blob) {
        const file = new File([blob], `live_proof_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const result = await api.uploadFile(file);
        setImageUrl(result.url);
      }
    } catch (e) {
      console.warn('Backend live photo upload failed, using high-res captured data URL:', e);
    } finally {
      setUploadingFile(false);
      setIsSnapping(false);
    }
  };

  // Retake live photo
  const handleRetakeLivePhoto = () => {
    setCapturedLivePhoto(null);
    setImageUrl(SAMPLE_PHOTO_PRESETS[0].url);
    startCamera();
  };

  // Handle image file upload with backend storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCapturedLivePhoto(base64);
      setImageUrl(base64);
    };
    reader.readAsDataURL(file);

    // Upload to backend API
    setUploadingFile(true);
    try {
      const result = await api.uploadFile(file);
      setImageUrl(result.url);
    } catch (err) {
      console.warn('Backend image upload failed, falling back to base64 encoding:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find((p) => p.id === selectedProjectId);
    if (!proj) return;

    onAddProof({
      projectId: proj.id,
      projectName: proj.name,
      location: locationRemarks.trim() || proj.location || 'Ghaziabad, UP',
      citizenName: isAnonymous ? 'Anonymous Citizen' : citizenName.trim() || 'Ghaziabad Resident',
      isAnonymous,
      imageUrl: imageUrl || SAMPLE_PHOTO_PRESETS[0].url,
      progressPercentage,
      workStatus,
      remarks: remarks.trim() || 'Live on-site progress photo proof submitted by citizen.',
      geoLat: liveGps?.lat ?? proj.latitude ?? 28.6692,
      geoLng: liveGps?.lng ?? proj.longitude ?? 77.4538,
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setModalOpen(false);
      // Reset
      setRemarks('');
      setLocationRemarks('');
      setCapturedLivePhoto(null);
      stopCamera();
    }, 1200);
  };

  // Filter Proofs
  const filteredProofs = useMemo(() => {
    return proofs.filter((p) => {
      if (filterType === 'STALLED') return p.workStatus === 'stalled' || p.workStatus === 'poor_quality';
      if (filterType === 'VERIFIED') return p.verifiedByCdo;
      if (filterType === 'DISCREPANCY') return p.progressPercentage < 50;
      return true;
    });
  }, [proofs, filterType]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 sm:p-6 space-y-6">
      {/* Hidden canvas for snapshot rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                Citizen Ground Truth Proofs & Live Photo Tracker
                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full border border-emerald-300 flex items-center gap-1">
                  <Radio className="h-3 w-3 text-emerald-600 animate-pulse" /> Live Camera Enabled
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Take live on-site camera snapshots of ongoing construction to verify physical progress against sanctioned funds.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setModalOpen(true);
            setPhotoSource('live_camera');
            setCapturedLivePhoto(null);
          }}
          className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Camera className="h-4 w-4" /> 📸 Open Live Camera Proof
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px]">
            <Filter className="h-3.5 w-3.5" /> Filter Proofs:
          </span>
          {(
            [
              { key: 'ALL', label: 'All Citizen Proofs', count: proofs.length },
              {
                key: 'DISCREPANCY',
                label: '⚠️ Progress Disparities',
                count: proofs.filter((p) => p.progressPercentage < 50).length,
              },
              {
                key: 'STALLED',
                label: '🛑 Stalled / Poor Quality',
                count: proofs.filter((p) => p.workStatus === 'stalled' || p.workStatus === 'poor_quality').length,
              },
              {
                key: 'VERIFIED',
                label: '⭐ CDO Endorsed',
                count: proofs.filter((p) => p.verifiedByCdo).length,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all border cursor-pointer ${
                filterType === tab.key
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label} <span className="text-[10px] opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          {filteredProofs.length} {t.evidenceReportsCount}
        </p>
      </div>

      {/* Grid of Citizen Photo Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredProofs.map((proof) => {
          const badge = statusBadgeConfig[proof.workStatus] || statusBadgeConfig.on_track;

          return (
            <div
              key={proof.id}
              className="bg-slate-50/80 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col group"
            >
              {/* Photo Viewport */}
              <div
                onClick={() => setSelectedImagePreview(proof.imageUrl)}
                className="relative h-48 sm:h-52 bg-slate-950 overflow-hidden cursor-pointer"
              >
                <img
                  src={proof.imageUrl}
                  alt={proof.projectName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Status Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shadow-sm ${badge.bg}`}>
                    {badge.label}
                  </span>
                  {proof.verifiedByCdo && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 border border-amber-300 shadow-sm flex items-center gap-1">
                      <Award className="h-3 w-3 fill-current" /> {t.cdoVerifiedBadge}
                    </span>
                  )}
                </div>

                {/* Progress Metric Chip */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="font-bold flex items-center gap-1 drop-shadow">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {t.physicalProgress} {proof.progressPercentage}%
                  </span>
                  <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1">
                    <Eye className="h-3 w-3 text-cyan-400" /> {t.clickToZoom}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      onClick={() => onSelectProject(proof.projectId)}
                      className="font-bold text-sm text-slate-900 hover:text-brand-600 transition-colors cursor-pointer leading-snug line-clamp-1"
                      title={proof.projectName}
                    >
                      {proof.projectName}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{proof.location}</span>
                  </p>

                  <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed italic">
                    "{proof.remarks}"
                  </div>
                </div>

                {/* Progress Bar Visualization */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>{t.citizenVerifiedCompletion}</span>
                    <span className="font-bold text-slate-800">{proof.progressPercentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        proof.progressPercentage < 40
                          ? 'bg-red-500'
                          : proof.progressPercentage < 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${proof.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Footer Meta & Actions */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-[11px]">
                    <UserIcon className="h-3 w-3 text-slate-400" />
                    {proof.citizenName}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Executive Verification Button */}
                    {canVerifyProof && onVerifyProof && (
                      <button
                        onClick={() => onVerifyProof(proof.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          proof.verifiedByCdo
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-200 hover:bg-amber-100 text-slate-700'
                        }`}
                        title="Executive Verification Authority"
                      >
                        <ShieldCheck className="h-3 w-3 text-amber-600" />
                        {proof.verifiedByCdo ? (isHindi ? 'प्रमाणित' : 'Endorsed') : (isHindi ? 'सत्यापित करें' : 'Verify')}
                      </button>
                    )}

                    {/* Upvote Button */}
                    <button
                      onClick={() => onUpvoteProof(proof.id)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <ThumbsUp className="h-3 w-3 text-brand-600" />
                      <span>{proof.upvotes}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULLSCREEN IMAGE MODAL */}
      {selectedImagePreview && (
        <div
          className="fixed inset-0 bg-slate-950/90 z-[99999] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in-up"
          onClick={() => setSelectedImagePreview(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedImagePreview(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-2 cursor-pointer flex items-center gap-1 font-bold text-xs"
            >
              <X className="h-6 w-6" /> {isHindi ? 'पूर्वावलोकन बंद करें' : 'Close Preview'}
            </button>
            <img
              src={selectedImagePreview}
              alt="Full Resolution Proof"
              className="max-h-[82vh] w-auto max-w-full rounded-2xl border border-slate-700 shadow-2xl object-contain"
            />
          </div>
        </div>
      )}

      {/* LIVE CAMERA / UPLOAD PROOF MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                stopCamera();
                setModalOpen(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{t.takeLivePhoto}</h3>
                <p className="text-xs text-slate-500">
                  {t.takeLivePhotoSub}
                </p>
              </div>
            </div>

            {submittedSuccess ? (
              <div className="py-10 text-center space-y-2 animate-fade-in-up">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-base text-slate-800">{isHindi ? 'धरातलीय साक्ष्य सफलतापूर्वक दर्ज हुआ!' : 'Live Ground Proof Uploaded Successfully!'}</h4>
                <p className="text-xs text-slate-500">
                  {isHindi ? 'आपकी जीपीएस-टैग युक्त साइट फोटो और भौतिक प्रगति रिपोर्ट को निगरानी डैशबोर्ड पर दर्ज कर दिया गया है।' : 'Your live geo-tagged photo and progress report have been logged on the surveillance dashboard.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                {/* Select Project Site */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.selectSite}</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.location})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Camera / Photo Capture Mode Switcher */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      {t.photoSourceMode}
                    </label>
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoSource('live_camera');
                          setCapturedLivePhoto(null);
                          startCamera();
                        }}
                        className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          photoSource === 'live_camera'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Video className="h-3.5 w-3.5" /> {t.cameraSourceLive}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoSource('upload_file');
                          stopCamera();
                        }}
                        className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          photoSource === 'upload_file'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <UploadCloud className="h-3.5 w-3.5" /> {t.cameraSourceUpload}
                      </button>
                    </div>
                  </div>

                  {/* MODE 1: LIVE CAMERA VIEWPORT */}
                  {photoSource === 'live_camera' && (
                    <div className="space-y-2">
                      <div className="relative h-64 sm:h-72 bg-slate-950 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-inner flex flex-col items-center justify-center">
                        {/* Live Video Feed */}
                        {!capturedLivePhoto && (
                          <>
                            <video
                              ref={videoRef}
                              playsInline
                              autoPlay
                              muted
                              className="w-full h-full object-cover"
                            />

                            {/* Camera HUD Grid Overlay */}
                            <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/20 m-3 rounded-xl flex flex-col justify-between p-2.5">
                              <div className="flex justify-between items-center text-[10px] text-white/90 font-mono">
                                <span className="bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
                                  <Radio className="h-3 w-3 text-emerald-400 animate-pulse" /> LIVE CAMERA FEED
                                </span>
                                <span className="bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700">
                                  GHAZIABAD SURVEILLANCE
                                </span>
                              </div>

                              {/* Center Viewfinder Target */}
                              <div className="flex items-center justify-center">
                                <Crosshair className="h-10 w-10 text-emerald-400/40 animate-pulse" />
                              </div>

                              {/* Bottom GPS Watermark Bar */}
                              <div className="bg-slate-900/85 backdrop-blur-sm p-2 rounded-lg border border-slate-700 text-white font-mono text-[10px] space-y-0.5">
                                <p className="text-emerald-400 font-bold flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> Live GPS Tag: {liveGps ? `${liveGps.lat.toFixed(5)}°N, ${liveGps.lng.toFixed(5)}°E` : 'Locking Coordinates...'}
                                </p>
                                <p className="text-slate-300">
                                  Site: {projects.find((p) => p.id === selectedProjectId)?.name || 'Ghaziabad'}
                                </p>
                              </div>
                            </div>

                            {/* Camera Action Buttons Floating */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                              <button
                                type="button"
                                onClick={toggleFacingMode}
                                className="bg-slate-900/80 hover:bg-slate-800 text-white p-2 rounded-xl border border-slate-700 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                title="Flip Front / Rear Camera"
                              >
                                <SwitchCamera className="h-4 w-4 text-emerald-400" />
                              </button>
                            </div>

                            {/* Shutter Button */}
                            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center z-20">
                              <button
                                type="button"
                                onClick={captureLivePhoto}
                                disabled={!cameraActive || isSnapping}
                                className="bg-white hover:bg-emerald-50 text-slate-950 font-black px-6 py-2.5 rounded-full shadow-2xl border-4 border-emerald-500 flex items-center gap-2 text-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                              >
                                <Camera className="h-4 w-4 text-emerald-600" />
                                {isSnapping ? (isHindi ? 'कैप्चर हो रहा है...' : 'Capturing...') : t.snapLivePhoto}
                              </button>
                            </div>
                          </>
                        )}

                        {/* Display Captured Live Photo */}
                        {capturedLivePhoto && (
                          <div className="relative w-full h-full">
                            <img
                              src={capturedLivePhoto}
                              alt="Captured Live Proof"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-400 shadow-md flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> {isHindi ? 'लाइव फोटो सुरक्षित' : 'Live Snapshot Captured'}
                            </div>
                            <button
                              type="button"
                              onClick={handleRetakeLivePhoto}
                              className="absolute top-3 right-3 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
                            >
                              <RefreshCw className="h-3.5 w-3.5 text-amber-400" /> {isHindi ? 'दोबारा फोटो लें' : 'Retake Photo'}
                            </button>
                          </div>
                        )}

                        {/* Error Fallback */}
                        {cameraError && !capturedLivePhoto && (
                          <div className="p-4 text-center text-white space-y-2">
                            <VideoOff className="h-10 w-10 text-red-400 mx-auto" />
                            <p className="font-bold text-xs text-red-300">{cameraError}</p>
                            <button
                              type="button"
                              onClick={startCamera}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 cursor-pointer"
                            >
                              {isHindi ? 'कैमरा पुनः प्रयास करें' : 'Retry Camera Permission'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* MODE 2: UPLOAD FILE FALLBACK */}
                  {photoSource === 'upload_file' && (
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50 hover:bg-slate-100/80 transition-colors relative">
                      {capturedLivePhoto || (imageUrl && imageUrl.startsWith('http')) ? (
                        <div className="relative h-40 rounded-xl overflow-hidden mb-2">
                          <img
                            src={capturedLivePhoto || imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCapturedLivePhoto(null);
                              setImageUrl(SAMPLE_PHOTO_PRESETS[0].url);
                            }}
                            className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-lg text-xs"
                          >
                            {isHindi ? 'फोटो बदलें' : 'Change Photo'}
                          </button>
                        </div>
                      ) : (
                        <div className="py-4 space-y-1">
                          {uploadingFile ? (
                            <>
                              <div className="h-7 w-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                              <p className="font-semibold text-emerald-700">{t.uploadingToServer}</p>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-8 w-8 text-slate-400 mx-auto" />
                              <p className="font-semibold text-slate-700">{isHindi ? 'फोटो फाइल चुनें या ड्रैग करें' : 'Click or drag photo file'}</p>
                              <p className="text-[10px] text-slate-400">JPG, PNG, WebP (max 10MB)</p>
                            </>
                          )}
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Preset Photo Selection Quick-Pick */}
                  <div className="mt-2">
                    <p className="text-[11px] text-slate-500 font-medium mb-1">{t.sampleSiteProof}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SAMPLE_PHOTO_PRESETS.map((preset) => (
                        <button
                          type="button"
                          key={preset.label}
                          onClick={() => {
                            stopCamera();
                            setImageUrl(preset.url);
                            setCapturedLivePhoto(preset.url);
                            setPhotoSource('upload_file');
                          }}
                          className={`p-1.5 text-[10px] font-semibold rounded-lg border text-left truncate transition-colors cursor-pointer ${
                            imageUrl === preset.url
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          📸 {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress Percentage Slider */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">{t.observedPhysicalCompletion}</label>
                    <span className="font-extrabold text-sm text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {progressPercentage}% {isHindi ? 'पूर्ण' : 'Completed'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={progressPercentage}
                    onChange={(e) => setProgressPercentage(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>0% ({isHindi ? 'प्रारंभिक / गड्ढा' : 'Just started/pit dug'})</span>
                    <span>50% ({isHindi ? 'पिलर / ढांचा' : 'Pillars/Structure'})</span>
                    <span>100% ({isHindi ? 'धरातल पर पूर्ण' : 'Fully Operational'})</span>
                  </div>
                </div>

                {/* Work Status Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{t.currentGroundStatus}</label>
                    <select
                      value={workStatus}
                      onChange={(e) => setWorkStatus(e.target.value as CitizenProofReport['workStatus'])}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="on_track">{isHindi ? '🟢 कार्य पूर्ण गति में (समय पर)' : '🟢 Work in Full Swing (On Track)'}</option>
                      <option value="slow">{isHindi ? '🟡 धीमी गति / कम श्रमिक' : '🟡 Slow Execution / Few Workers'}</option>
                      <option value="stalled">{isHindi ? '🔴 रुका हुआ / परित्यक्त कार्य' : '🔴 Stalled / Abandoned Work'}</option>
                      <option value="poor_quality">{isHindi ? '⚠️ घटिया सामग्री' : '⚠️ Substandard / Low Quality Material'}</option>
                      <option value="completed">{isHindi ? '🔵 पूर्ण एवं चालू' : '🔵 Completed & Functional'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{t.specificLandmark}</label>
                    <input
                      type="text"
                      placeholder={isHindi ? 'उदा. वार्ड 8 स्कूल गेट के पास, मोदीनगर' : 'e.g., Near Ward 8 School Gate, Modinagar'}
                      value={locationRemarks}
                      onChange={(e) => setLocationRemarks(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.detailedObservations}</label>
                  <textarea
                    rows={2}
                    required
                    placeholder={isHindi ? 'धरातल पर जो दिखाई दे रहा है उसे विस्तार से लिखें (उदा. 2 महीने से कार्य बंद, खंभे खड़े हैं बल्ब नहीं लगे)...' : 'Describe what is visible on ground (e.g. trench left open, streetlight poles erected without bulbs, work stopped since 2 months)...'}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Citizen Details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anonCheck"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="accent-emerald-600 h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="anonCheck" className="text-slate-600 font-medium cursor-pointer">
                      {t.submitAsAnonymous}
                    </label>
                  </div>

                  {!isAnonymous && (
                    <input
                      type="text"
                      placeholder={t.yourNamePlaceholder}
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 w-full sm:w-48"
                    />
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setModalOpen(false);
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {t.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingFile}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {uploadingFile ? (isHindi ? 'फोटो अपलोड हो रही है...' : 'Uploading Photo...') : t.submitReportBtn}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
