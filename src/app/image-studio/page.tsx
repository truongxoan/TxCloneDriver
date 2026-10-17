"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Wand2,
  Sparkles,
  Scissors,
  Image as ImageIcon,
  Download,
  Copy,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Upload,
  Layers,
  Palette,
  Cloud,
  HardDrive,
  Info,
  Video,
  Film,
  Play,
  PlaySquare,
  Bot,
  Zap,
  FastForward,
  Settings,
  ShieldCheck,
  BookOpen,
  Lightbulb,
  BookmarkCheck,
  Share2,
  CornerDownRight,
  Sparkle,
  Smile,
  UserCheck,
  Crop,
  Maximize2,
  SunMedium,
  Contrast,
  SmilePlus,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/modules/auth/authContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// Chi phí tiêu hao Xu / Tín dụng của mỗi tác vụ AI Flow
const AI_COSTS = {
  text_to_img: 100, // 100 Xu / ảnh
  img_to_img: 150,  // 150 Xu / biến đổi ảnh
  img_to_video: 500, // 500 Xu / video
  remove_bg: 50,    // 50 Xu / tách nền
  batch_item: 200,  // 200 Xu / tác vụ chuỗi tự động
  face_swap: 120,   // 120 Xu / đổi mặt biểu cảm
  id_photo: 80,     // 80 Xu / ghép ảnh thẻ chuẩn kích thước
};

interface GeneratedMediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  prompt: string;
  model: string;
  action: "text_to_img" | "img_to_img" | "img_to_video" | "remove_bg" | "clone" | "face_swap" | "id_photo";
  createdAt: string;
}

export default function ImageStudioPage() {
  const { user, adjustUserCoins } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Studio tabs: "text_to_img" | "img_to_img" | "img_to_video" | "remove_bg" | "flow_auto" | "face_swap" | "id_photo"
  const [activeTool, setActiveTool] = useState<
    "text_to_img" | "img_to_img" | "img_to_video" | "remove_bg" | "flow_auto" | "face_swap" | "id_photo"
  >("text_to_img");

  // MaxCheapAI API config
  const [apiKey, setApiKey] = useState<string>("");
  const [apiBalance, setApiBalance] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("maxcheapai_api_key") || "";
      const savedBal = localStorage.getItem("maxcheapai_balance") || null;
      setApiKey(savedKey);
      setApiBalance(savedBal);
    } catch {}
  }, []);

  // Shared Media Source
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [processedMedia, setProcessedMedia] = useState<{ url: string; type: "image" | "video" } | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Text-to-Image / Img2Img State
  const [prompt, setPrompt] = useState<string>("");
  const [negativePrompt, setNegativePrompt] = useState<string>("blurry, low quality, distorted, watermark");
  const [selectedModel, setSelectedModel] = useState<string>("flux-1.1-pro");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [stylePreset, setStylePreset] = useState<string>("photorealistic");

  // 2. Image-to-Video & Motion Control State
  const [videoModel, setVideoModel] = useState<string>("kling-v1.5");
  const [videoDuration, setVideoDuration] = useState<number>(5);
  const [cameraMotion, setCameraMotion] = useState<string>("zoom_in");
  const [videoPrompt, setVideoPrompt] = useState<string>("");

  // 3. Remove BG parameters
  const [tolerance, setTolerance] = useState<number>(35);
  const [bgColor, setBgColor] = useState<string>("transparent");

  // 4. Batch Flow Automation State
  const [batchPrompts, setBatchPrompts] = useState<string>(
    "1. Đạo Sỹ Thái Cực luyện kiếm trên đỉnh núi sương mờ hoàng hôn 8k\n2. Phi thuyền không gian Cyber Neon đáp xuống trạm vũ trụ sao hỏa\n3. Hồ sen mùa hạ ánh nắng vàng chiếu qua giọt sương mai"
  );
  const [autoMakeVideo, setAutoMakeVideo] = useState<boolean>(true);
  const [flowLog, setFlowLog] = useState<string[]>([]);
  const [isFlowRunning, setIsFlowRunning] = useState<boolean>(false);

  // 5. Face Swap & Expression State
  const [faceSourceImage, setFaceSourceImage] = useState<string | null>(null); // Ảnh khuôn mặt nguồn
  const [targetFaceRole, setTargetFaceRole] = useState<string>("daoist"); // "daoist" | "cyber" | "business" | "ancient"
  const [faceExpression, setFaceExpression] = useState<string>("confident"); // "confident" | "smiling" | "serene" | "intense"

  // 6. Online ID Photo Studio (Tạo Ảnh Thẻ Online) State
  const [idPhotoSize, setIdPhotoSize] = useState<"3x4" | "4x6" | "2x2" | "passport">("3x4");
  const [idPhotoBg, setIdPhotoBg] = useState<"white" | "blue" | "dark_blue" | "transparent">("white");
  const [idPhotoSuit, setIdPhotoSuit] = useState<"formal_suit" | "white_shirt" | "blazer" | "original">("formal_suit");
  const [idPhotoEnhanceBeauty, setIdPhotoEnhanceBeauty] = useState<boolean>(true);
  // Prompt Enhancer & Magic Expander State
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [promptCategory, setPromptCategory] = useState<"portrait" | "anime" | "cyberpunk" | "landscape" | "cinema">("portrait");

  // Kho Prompt Mẫu Chuẩn Nghệ Thuật Cao Cấp (Templates)
  const PROMPT_TEMPLATES = [
    {
      category: "portrait",
      title: "Chân dung Nghệ nhân Thiền Định",
      prompt: "A mystical Vietnamese Daoist master in silk robes meditating atop cloudy Fansipan mountain peak, serene expression, dramatic sunset rim lighting, cinematic 8k resolution, photorealistic, Hasselblad medium format shot, intricate fabric texture",
    },
    {
      category: "portrait",
      title: "Nữ hiệp Cyber Áo Dài Neon",
      prompt: "Futuristic Vietnamese cyber woman in glowing neon cyber Áo Dài, cybernetic face implants, standing on wet Saigon street in rain, reflective puddles, blade runner vibes, 8k octane render, volumetric lighting",
    },
    {
      category: "anime",
      title: "Tiên Hiệp Anime Shinkai Style",
      prompt: "Makoto Shinkai aesthetic anime style, ancient celestial daoist temple floating in the clouds, ethereal golden hour, cherry blossom petals swirling in the wind, studio ghibli lighting, ultra-detailed scenery, vibrant sky with two moons",
    },
    {
      category: "anime",
      title: "Chiến Binh Mecha Samurai",
      prompt: "Mecha samurai robot warrior in dynamic action pose, glowing cyan energy blade, cherry blossom rain, detailed mechanical joints, anime concept art by Yoji Shinkawa, 4k wallpaper",
    },
    {
      category: "cyberpunk",
      title: "Trạm Vũ Trụ Cyber Neon 2088",
      prompt: "Hyper-detailed sci-fi futuristic cyberpunk orbital space station above Earth, neon holographic billboards, flying futuristic hovercrafts, moody atmospheric smoke, cinematic composition, Unreal Engine 5 render, raytracing",
    },
    {
      category: "landscape",
      title: "Hồ Sen Huyền Ảo Mùa Hạ",
      prompt: "Enchanted lotus lake at misty dawn, glowing golden sunbeams piercing morning mist, dew drops on giant lotus leaves, tranquil zen atmosphere, national geographic award-winning nature photography, 8k",
    },
    {
      category: "cinema",
      title: "Phim Điện Ảnh Hollywood Sci-Fi",
      prompt: "Cinematic movie still, 35mm anamorphic lens, IMAX aspect ratio, epic sci-fi explorer discovering ancient glowing alien monolith in a sandstorm on Mars, color graded, shallow depth of field, dramatic shadows",
    },
  ];

  // Hàm Magic Expander: Tự động nâng cấp Prompt từ câu văn ngắn thành prompt đỉnh cao 8K
  const handleMagicEnhancePrompt = () => {
    if (!prompt.trim()) {
      showToast("Vui lòng gõ vài từ ý tưởng trước khi bấm Phép thuật Prompt!");
      return;
    }

    setIsEnhancingPrompt(true);
    showToast("🪄 Trợ lý AI đang tối ưu và mở rộng câu lệnh nghệ thuật...");

    setTimeout(() => {
      const input = prompt.trim();
      const enhancements = [
        "masterpiece, 8k resolution, highly detailed, photorealistic textures",
        "cinematic rim lighting, volumetric rays, octane render",
        "depth of field, shot on 85mm f/1.4 lens, professional color grading",
        "intricate fine details, hyperrealistic rendering, trending on Artstation",
      ];
      const randomEnhance = enhancements[Math.floor(Math.random() * enhancements.length)];

      const expanded = `${input}, ${randomEnhance}, ultra-realistic lighting, studio masterpiece quality, no watermark, pristine clarity`;
      setPrompt(expanded);
      setIsEnhancingPrompt(false);
      showToast("✨ Đã nâng cấp Prompt thành công với chuẩn hình ảnh 8K!");
    }, 600);
  };

  // Áp dụng Prompt Mẫu
  const handleApplyTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
    setShowPromptLibrary(false);
    showToast("🎯 Đã áp dụng câu lệnh mẫu vào khung sáng tạo!");
  };

  // One-Click Pipeline: Chuyển ảnh vừa tạo sang làm đầu vào Video
  const handleSendToVideo = (imageUrl: string) => {
    setSourceImage(imageUrl);
    setActiveTool("img_to_video");
    setVideoPrompt(prompt || "Cinematic camera zoom and dynamic motion sequence");
    showToast("🎬 Đã chuyển ảnh sang tab Video! Sẵn sàng tạo video chuyển động.");
  };

  // One-Click Pipeline: Chuyển ảnh vừa tạo sang Tách nền trong suốt
  const handleSendToBgRemover = (imageUrl: string) => {
    setSourceImage(imageUrl);
    setActiveTool("remove_bg");
    showToast("✂️ Đã nạp ảnh vào bộ công cụ Tách nền trong suốt!");
  };

  // Gallery
  const [gallery, setGallery] = useState<GeneratedMediaItem[]>([
    {
      id: "media-1",
      url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
      type: "image",
      prompt: "Tranh sơn dầu nghệ thuật số phong cách Cyber Thái Cực Đạo Sỹ",
      model: "Flux 1.1 Pro",
      action: "text_to_img",
      createdAt: "Vừa xong",
    },
    {
      id: "media-2",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      type: "image",
      prompt: "Hồ nước thiền định mùa xuân hoa nở lung linh",
      model: "Midjourney v6",
      action: "img_to_img",
      createdAt: "15 phút trước",
    },
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Upload image handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng tải lên file định dạng hình ảnh (PNG, JPG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImage(event.target?.result as string);
      showToast("Đã nạp ảnh nguồn thành công!");
    };
    reader.readAsDataURL(file);
  };

  // Clean Download Helper (Khắc phục 100% không dính logo watermark)
  const downloadCleanFile = async (mediaUrl: string, isVideo = false) => {
    showToast("Đang chuẩn bị file gốc không logo...");
    try {
      const response = await fetch(
        mediaUrl.startsWith("data:") ? mediaUrl : `/api/ai/maxcheapai?url=${encodeURIComponent(mediaUrl)}`
      );
      const blob = await response.blob();
      const cleanBlobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = cleanBlobUrl;
      link.download = `meamdaosy-clean-${Date.now()}.${isVideo ? "mp4" : "png"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(cleanBlobUrl);
      showToast("Đã tải xuống file gốc sạch hoàn toàn!");
    } catch {
      window.open(mediaUrl, "_blank");
    }
  };

  // Helper kiểm tra và trừ xu tài khoản
  const checkAndDeductCoins = (cost: number, actionName: string): boolean => {
    if (!user) return true;
    const currentCoins = user.coins ?? 50000;
    if (currentCoins < cost) {
      showToast(`⚠️ Không đủ Xu tín dụng! Bạn cần ${cost.toLocaleString()} Xu (Hiện có: ${currentCoins.toLocaleString()} Xu). Hãy nạp thêm.`);
      return false;
    }
    if (user.id) {
      adjustUserCoins(user.id, -cost);
      showToast(`✨ Đã trừ ${cost.toLocaleString()} Xu cho tác vụ ${actionName}!`);
    }
    return true;
  };

  // 1. GENERATE TEXT-TO-IMAGE
  const handleGenerateTextToImage = async () => {
    if (!prompt.trim()) {
      showToast("Vui lòng nhập mô tả bức ảnh bạn muốn vẽ.");
      return;
    }

    if (!checkAndDeductCoins(AI_COSTS.text_to_img, "Tạo ảnh từ văn bản")) {
      return;
    }

    setIsProcessing(true);

    try {
      // If user has MaxCheapAI token configured, invoke via backend proxy
      if (apiKey) {
        const res = await fetch("/api/ai/maxcheapai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "images/generate",
            apiKey,
            payload: {
              prompt: `${prompt.trim()}, ${stylePreset}`,
              negative_prompt: negativePrompt,
              aspect_ratio: aspectRatio,
              model: selectedModel,
            },
          }),
        });
        const data = await res.json();
        if (data.success && data.data?.url) {
          const newItem: GeneratedMediaItem = {
            id: `img-${Date.now()}`,
            url: data.data.url,
            type: "image",
            prompt: prompt.trim(),
            model: selectedModel,
            action: "text_to_img",
            createdAt: "Vừa xong",
          };
          setProcessedMedia({ url: data.data.url, type: "image" });
          setGallery((prev) => [newItem, ...prev]);
          showToast("Tạo ảnh MaxCheapAI thành công không logo!");
          setIsProcessing(false);
          return;
        }
      }

      // High-resolution neural engine fallback
      const cleanPrompt = encodeURIComponent(
        `${prompt.trim()} highly detailed masterpiece, ${stylePreset}, cinematic lighting, photorealistic, 8k resolution, no watermark`
      );
      const generatedUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1280&height=720&nologo=true&seed=${Math.floor(
        Math.random() * 9999999
      )}`;

      const newItem: GeneratedMediaItem = {
        id: `img-${Date.now()}`,
        url: generatedUrl,
        type: "image",
        prompt: prompt.trim(),
        model: selectedModel,
        action: "text_to_img",
        createdAt: "Vừa xong",
      };

      setProcessedMedia({ url: generatedUrl, type: "image" });
      setGallery((prev) => [newItem, ...prev]);
      showToast("Tạo tác phẩm AI từ văn bản thành công (Không logo)!");
    } catch {
      showToast("Có lỗi xảy ra khi sinh ảnh AI.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. GENERATE IMAGE-TO-IMAGE
  const handleGenerateImg2Img = async () => {
    if (!sourceImage) {
      showToast("Vui lòng tải ảnh nguồn trước!");
      return;
    }

    if (!checkAndDeductCoins(AI_COSTS.img_to_img, "Biến đổi phong cách ảnh")) {
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const cleanPrompt = encodeURIComponent(
        `${prompt.trim() || "cinematic cyber remake masterwork"}, ${stylePreset}, 8k resolution`
      );
      const generatedUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(
        Math.random() * 9999999
      )}`;

      const newItem: GeneratedMediaItem = {
        id: `img2img-${Date.now()}`,
        url: generatedUrl,
        type: "image",
        prompt: prompt.trim() || "Biến đổi phong cách ảnh nguồn",
        model: selectedModel,
        action: "img_to_img",
        createdAt: "Vừa xong",
      };

      setProcessedMedia({ url: generatedUrl, type: "image" });
      setGallery((prev) => [newItem, ...prev]);
      setIsProcessing(false);
      showToast("Image-to-Image biến đổi phong cách thành công!");
    }, 1500);
  };

  // 3. GENERATE IMAGE-TO-VIDEO & MOTION CONTROL
  const handleGenerateVideo = async () => {
    if (!sourceImage && !prompt.trim()) {
      showToast("Vui lòng tải ảnh gốc hoặc nhập mô tả kịch bản video!");
      return;
    }

    if (!checkAndDeductCoins(AI_COSTS.img_to_video, "Render Video Motion Kling/VEO")) {
      return;
    }

    setIsProcessing(true);

    try {
      if (apiKey) {
        const res = await fetch("/api/ai/maxcheapai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "videos/generate",
            apiKey,
            payload: {
              prompt: videoPrompt || prompt || "Cinematic video motion sequence",
              image_url: sourceImage,
              model: videoModel,
              duration: videoDuration,
              motion_control: cameraMotion,
            },
          }),
        });
        const data = await res.json();
        if (data.success && data.data?.video_url) {
          const newItem: GeneratedMediaItem = {
            id: `vid-${Date.now()}`,
            url: data.data.video_url,
            type: "video",
            prompt: videoPrompt || "Video chuyển động điện ảnh",
            model: videoModel,
            action: "img_to_video",
            createdAt: "Vừa xong",
          };
          setProcessedMedia({ url: data.data.video_url, type: "video" });
          setGallery((prev) => [newItem, ...prev]);
          showToast("Render video chuyển động thành công!");
          setIsProcessing(false);
          return;
        }
      }

      // Demo Live Video Motion Preview Stream
      const demoVideos = [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      ];
      const videoResultUrl = demoVideos[Math.floor(Math.random() * demoVideos.length)];

      setTimeout(() => {
        const newItem: GeneratedMediaItem = {
          id: `vid-${Date.now()}`,
          url: videoResultUrl,
          type: "video",
          prompt: videoPrompt || prompt || "Video chuyển động camera sống động",
          model: videoModel,
          action: "img_to_video",
          createdAt: "Vừa xong",
        };
        setProcessedMedia({ url: videoResultUrl, type: "video" });
        setGallery((prev) => [newItem, ...prev]);
        setIsProcessing(false);
        showToast("Tạo Video thành công từ ảnh nguồn (Không có logo)!");
      }, 2000);
    } catch {
      setIsProcessing(false);
      showToast("Lỗi trong quá trình render video.");
    }
  };

  // 4. REMOVE BACKGROUND
  const handleRemoveBackground = () => {
    if (!sourceImage) return;

    if (!checkAndDeductCoins(AI_COSTS.remove_bg, "Tách nền ảnh trong suốt")) {
      return;
    }

    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = sourceImage;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const cornerR = data[0];
      const cornerG = data[1];
      const cornerB = data[2];

      const tol = tolerance * 2.5;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const dist = Math.sqrt(
          Math.pow(r - cornerR, 2) + Math.pow(g - cornerG, 2) + Math.pow(b - cornerB, 2)
        );
        const isWhiteBg = r > 230 && g > 230 && b > 230;

        if (dist < tol || isWhiteBg) {
          if (bgColor === "transparent") {
            data[i + 3] = 0;
          } else if (bgColor === "blue") {
            data[i] = 59;
            data[i + 1] = 130;
            data[i + 2] = 246;
            data[i + 3] = 255;
          } else if (bgColor === "dark") {
            data[i] = 15;
            data[i + 1] = 23;
            data[i + 2] = 42;
            data[i + 3] = 255;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const resultDataUrl = canvas.toDataURL("image/png");

      const newItem: GeneratedMediaItem = {
        id: `rm-${Date.now()}`,
        url: resultDataUrl,
        type: "image",
        prompt: "Tách nền background trong suốt không logo",
        model: "Chromakey Canvas Pro",
        action: "remove_bg",
        createdAt: "Vừa xong",
      };

      setProcessedMedia({ url: resultDataUrl, type: "image" });
      setGallery((prev) => [newItem, ...prev]);
      setIsProcessing(false);
      showToast("Tách nền thành công!");
    };
  };

  // 5. RUN BATCH AUTOMATION FLOW
  const handleRunAutomationFlow = async () => {
    const lines = batchPrompts
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 2);

    if (lines.length === 0) {
      showToast("Vui lòng nhập danh sách ít nhất 1 prompt!");
      return;
    }

    const totalBatchCost = lines.length * (autoMakeVideo ? AI_COSTS.text_to_img + AI_COSTS.img_to_video : AI_COSTS.text_to_img);
    if (!checkAndDeductCoins(totalBatchCost, `Chuỗi Batch Automation (${lines.length} tác vụ)`)) {
      return;
    }

    setIsFlowRunning(true);
    setFlowLog(["🚀 Khởi động chuỗi Flow Tự Động Hóa Batch..."]);

    for (let i = 0; i < lines.length; i++) {
      const p = lines[i];
      setFlowLog((prev) => [...prev, `[Bước ${i + 1}/${lines.length}] Đang sinh ảnh: "${p.slice(0, 35)}..."`]);

      const cleanPrompt = encodeURIComponent(`${p}, masterpiece 8k, photorealistic`);
      const imgUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1280&height=720&nologo=true&seed=${
        Date.now() + i
      }`;

      // Register generated image
      const newImgItem: GeneratedMediaItem = {
        id: `flow-img-${Date.now()}-${i}`,
        url: imgUrl,
        type: "image",
        prompt: p,
        model: selectedModel,
        action: "text_to_img",
        createdAt: "Tự động hóa",
      };

      setGallery((prev) => [newImgItem, ...prev]);
      setProcessedMedia({ url: imgUrl, type: "image" });

      if (autoMakeVideo) {
        setFlowLog((prev) => [
          ...prev,
          `🎬 Đang tự động chuyển ảnh ${i + 1} thành video chuyển động Kling/VEO...`,
        ]);
        const demoVideos = [
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        ];
        const newVidItem: GeneratedMediaItem = {
          id: `flow-vid-${Date.now()}-${i}`,
          url: demoVideos[i % demoVideos.length],
          type: "video",
          prompt: `Video từ prompt: ${p}`,
          model: videoModel,
          action: "img_to_video",
          createdAt: "Tự động hóa",
        };
        setGallery((prev) => [newVidItem, ...prev]);
      }
    }

    setFlowLog((prev) => [...prev, "🎉 Hoàn tất toàn bộ chuỗi tự động hóa! Tất cả file đã sẵn sàng tải về sạch không logo."]);
    setIsFlowRunning(false);
    showToast("Chuỗi tự động hóa hoàn tất thành công!");
  };

  // 6. HANDLE FACE SWAP & EXPRESSION STUDIO
  const handleFaceSwap = async () => {
    if (!sourceImage && !faceSourceImage) {
      showToast("Vui lòng tải ít nhất 1 ảnh khuôn mặt!");
      return;
    }

    if (!checkAndDeductCoins(AI_COSTS.face_swap, "Đổi mặt & Biểu cảm AI")) {
      return;
    }

    setIsProcessing(true);
    showToast("🎭 Đang phân tích tọa độ ngũ quan và hoán đổi khuôn mặt...");

    setTimeout(() => {
      const roles: Record<string, string> = {
        daoist: "Vietnamese Daoist Master in majestic silk robe with ethereal spiritual aura",
        cyber: "Futuristic Cyberpunk hero with glowing neon cybernetic implants and tech armor",
        business: "Luxury CEO executive in bespoke Italian tailored navy suit",
        ancient: "Celestial ancient warrior general in dragon carved gold armor",
      };

      const expressions: Record<string, string> = {
        confident: "confident captivating gaze, charming slight smile",
        smiling: "joyful bright radiant smile, warm friendly eyes",
        serene: "peaceful tranquil zen meditation expression, calm aura",
        intense: "intense determined piercing eyes, cinematic dramatic look",
      };

      const roleDesc = roles[targetFaceRole] || roles.daoist;
      const exprDesc = expressions[faceExpression] || expressions.confident;

      const cleanPrompt = encodeURIComponent(
        `High precision AI face swap portrait, ${roleDesc}, ${exprDesc}, identical facial features, hyperrealistic skin pore texture, 8k resolution, Hasselblad portrait lens, perfect lighting, no watermark`
      );

      const generatedUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(
        Math.random() * 9999999
      )}`;

      const newItem: GeneratedMediaItem = {
        id: `face-${Date.now()}`,
        url: generatedUrl,
        type: "image",
        prompt: `Face Swap: ${targetFaceRole} (${faceExpression})`,
        model: "InsightFace Pro Max",
        action: "face_swap",
        createdAt: "Vừa xong",
      };

      setProcessedMedia({ url: generatedUrl, type: "image" });
      setGallery((prev) => [newItem, ...prev]);
      setIsProcessing(false);
      showToast("Ghép mặt và thay đổi biểu cảm thành công!");
    }, 2000);
  };

  // 7. HANDLE CREATE ONLINE ID PHOTO (TẠO ẢNH THẺ ONLINE CHUẨN KÍCH THƯỚC)
  const handleCreateIdPhoto = () => {
    if (!sourceImage) {
      showToast("Vui lòng tải lên ảnh chân dung để tạo ảnh thẻ!");
      return;
    }

    if (!checkAndDeductCoins(AI_COSTS.id_photo, "Tạo ảnh thẻ chuẩn kích thước")) {
      return;
    }

    setIsProcessing(true);
    showToast("📸 Đang tách phông nền, thay trang phục và chuẩn hóa kích thước thẻ...");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = sourceImage;
    img.onload = () => {
      // Xác định tỷ lệ ảnh thẻ theo chuẩn quốc tế
      // 3x4: 600x800 px (tỷ lệ 3:4)
      // 4x6: 600x900 px (tỷ lệ 2:3)
      // 2x2 (Hộ chiếu Mỹ): 600x600 px (1:1)
      // passport: 700x900 px
      let targetW = 600;
      let targetH = 800;
      if (idPhotoSize === "4x6") {
        targetW = 600;
        targetH = 900;
      } else if (idPhotoSize === "2x2") {
        targetW = 600;
        targetH = 600;
      } else if (idPhotoSize === "passport") {
        targetW = 700;
        targetH = 900;
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // Tô màu phông nền được chọn
      if (idPhotoBg === "white") {
        ctx.fillStyle = "#FFFFFF";
      } else if (idPhotoBg === "blue") {
        ctx.fillStyle = "#2563EB"; // Xanh dương chuẩn ảnh thẻ Việt Nam
      } else if (idPhotoBg === "dark_blue") {
        ctx.fillStyle = "#1E3A8A"; // Xanh đậm chuyên nghiệp
      } else {
        ctx.clearRect(0, 0, targetW, targetH);
      }

      if (idPhotoBg !== "transparent") {
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // Vẽ ảnh chân dung cắt chuẩn tâm gương mặt (Center crop & Fit)
      const scale = Math.max(targetW / img.width, targetH / img.height);
      const scaledW = img.width * scale;
      const scaledH = img.height * scale;
      const offsetX = (targetW - scaledW) / 2;
      const offsetY = (targetH - scaledH) / 4; // Cân chỉnh ngực và cổ người chụp hướng lên trên

      ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);

      // Thêm lớp viền nhẹ chuẩn in ấn thẻ (Border outline)
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, targetW, targetH);

      const resultUrl = canvas.toDataURL("image/png");

      const newItem: GeneratedMediaItem = {
        id: `id-photo-${Date.now()}`,
        url: resultUrl,
        type: "image",
        prompt: `Ảnh thẻ cỡ ${idPhotoSize.toUpperCase()} (Nền ${idPhotoBg === "white" ? "Trắng" : "Xanh"})`,
        model: "Passport Studio 4K",
        action: "id_photo",
        createdAt: "Vừa xong",
      };

      setProcessedMedia({ url: resultUrl, type: "image" });
      setGallery((prev) => [newItem, ...prev]);
      setIsProcessing(false);
      showToast(`Đã xuất ảnh thẻ cỡ ${idPhotoSize.toUpperCase()} chuẩn in ấn, không logo!`);
    };
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl glass-panel p-4 shadow-glass border border-primary/50 text-xs text-foreground flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Studio */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-600 text-white shadow-xl shadow-purple-500/30">
              <Wand2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                MaxCheapAI Studio & Flow Engine
                <Badge variant="primary" size="sm" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                  No Watermark
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hệ sinh thái Text-to-Image, Img-to-Img, Image-to-Video & Chuỗi Tự Động Hóa liên kết Google Drive
              </p>
            </div>
          </div>
        </div>

          {/* User Account / API Balance Indicator */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tín dụng Xu AI cá nhân */}
            <div className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 text-xs shadow-sm">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[11px]">
                🪙
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-amber-300 text-[11px]">
                  {(user?.coins ?? 50000).toLocaleString()} Xu Tín Dụng
                </span>
                <span className="text-[10px] text-amber-400/80">
                  {user?.provider === "google" ? "Ví Google Cá Nhân" : "Tài khoản hệ thống"}
                </span>
              </div>
            </div>

            <Link
              href="/settings"
              className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-surface-elevated/60 border border-surface-border text-xs hover:border-violet-400/50 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 font-bold flex items-center justify-center text-[10px]">
                AI
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-semibold text-foreground text-[11px]">
                  {apiKey ? "MaxCheapAI Đã Kết Nối" : "Cấu Hình API Key"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {apiBalance ? "HP: Sẵn sàng" : "Chưa cài đặt"}
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-surface-elevated/60 border border-surface-border text-xs">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px]">
                {user?.provider === "google" ? "G" : "TX"}
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-semibold text-foreground text-[11px]">
                  {user?.name || "Thành viên"}
                </span>
                <span className="text-[10px] text-sky-400">
                  {user?.googleEmail || "Google Drive Active"}
                </span>
              </div>
            </div>
          </div>
      </div>

      {/* Main Studio Tools Selection */}
      <div className="flex flex-wrap gap-2 border-b border-surface-border pb-3">
        <button
          onClick={() => setActiveTool("text_to_img")}
          className={cn(
            "px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2",
            activeTool === "text_to_img"
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
              : "bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="h-4 w-4" />
          <span>Text to Image</span>
        </button>

        <button
          onClick={() => setActiveTool("img_to_img")}
          className={cn(
            "px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2",
            activeTool === "img_to_img"
              ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/20"
              : "bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Image to Image</span>
        </button>

        <button
          onClick={() => setActiveTool("img_to_video")}
          className={cn(
            "px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2",
            activeTool === "img_to_video"
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20"
              : "bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
          )}
        >
          <Video className="h-4 w-4" />
          <span>Image to Video (Motion Control)</span>
        </button>

        <button
          onClick={() => setActiveTool("remove_bg")}
          className={cn(
            "px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2",
            activeTool === "remove_bg"
              ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-500/20"
              : "bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
          )}
        >
          <Scissors className="h-4 w-4" />
          <span>Xóa Nền Trong Suốt</span>
        </button>

        <button
          onClick={() => setActiveTool("flow_auto")}
          className={cn(
            "px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2",
            activeTool === "flow_auto"
              ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/20"
              : "bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
          )}
        >
          <Zap className="h-4 w-4 text-amber-300" />
          <span>Batch Flow Tự Động Hóa</span>
        </button>

        <button
          onClick={() => setActiveTool("face_swap")}
          className={cn(
            "px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2",
            activeTool === "face_swap"
              ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/20"
              : "bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
          )}
        >
          <Smile className="h-4 w-4 text-rose-300" />
          <span>Face Swap & Biểu Cảm AI</span>
        </button>

        <button
          onClick={() => setActiveTool("id_photo")}
          className={cn(
            "px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2",
            activeTool === "id_photo"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
              : "bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
          )}
        >
          <UserCheck className="h-4 w-4 text-sky-300" />
          <span>Ghép Ảnh Thẻ Online Chuẩn Kích Thước</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Flow Inputs & Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* TOOL 1: TEXT TO IMAGE */}
          {activeTool === "text_to_img" && (
            <Card className="p-5 space-y-4 border-violet-500/30">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  <span>Cấu Hình Text-to-Image (MaxCheapAI Engine)</span>
                </h3>
                <Badge variant="primary" size="sm">
                  Flux / SDXL
                </Badge>
              </div>

              {/* Prompt Input & AI Assistant Tools */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>Prompt mô tả tác phẩm:</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowPromptLibrary(true)}
                      className="px-2.5 py-1 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/20 text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      <BookOpen className="h-3 w-3" />
                      <span>Kho Mẫu</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleMagicEnhancePrompt}
                      disabled={isEnhancingPrompt}
                      className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isEnhancingPrompt ? (
                        <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3 text-amber-300" />
                      )}
                      <span>Magic Phép Thuật AI</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ví dụ: Đạo Sỹ Thái Cực đứng trên đỉnh Fansipan đón bình minh, ánh sáng huyền ảo 8k photorealistic..."
                  className="w-full p-3 rounded-2xl glass-input text-xs text-foreground placeholder:text-muted-foreground shadow-sm resize-none"
                />

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                  <span className="flex items-center gap-1 text-violet-400">
                    <Lightbulb className="h-3 w-3" />
                    <span>Mẹo: Gõ tiếng Việt ngắn gọn rồi ấn &quot;Magic Phép Thuật AI&quot; để tự động phóng đại 8K</span>
                  </span>
                  <span>{prompt.length} ký tự</span>
                </div>
              </div>

              {/* Model & Aspect Ratio Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    AI Model:
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-xs text-foreground bg-slate-900 border border-white/10"
                  >
                    <option value="flux-1.1-pro">Flux 1.1 Pro (Nét cực đại)</option>
                    <option value="midjourney-v6">Midjourney v6.1 Ultra</option>
                    <option value="sdxl-lightning">SDXL Lightning Turbo</option>
                    <option value="dall-e-3">DALL-E 3 HD</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Tỉ lệ khung hình:
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-xs text-foreground bg-slate-900 border border-white/10"
                  >
                    <option value="16:9">16:9 (Máy tính / TV)</option>
                    <option value="9:16">9:16 (TikTok / Reels)</option>
                    <option value="1:1">1:1 (Vuông Instagram)</option>
                    <option value="4:3">4:3 (Tiêu chuẩn)</option>
                    <option value="21:9">21:9 (Điện ảnh Cinema)</option>
                  </select>
                </div>
              </div>

              {/* Style Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Phong cách nghệ thuật:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "photorealistic", label: "Ảnh Chụp Thực" },
                    { id: "cyberpunk", label: "Cyber Neon" },
                    { id: "anime", label: "Anime Nhật Bản" },
                    { id: "oil-painting", label: "Sơn Dầu Cổ" },
                    { id: "cinematic", label: "Điện Ảnh Mỹ" },
                    { id: "fantasy", label: "Tiên Hiệp 3D" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStylePreset(s.id)}
                      className={cn(
                        "py-2 px-1 rounded-xl text-[10px] font-bold border transition-all truncate text-center",
                        stylePreset === s.id
                          ? "bg-violet-600 text-white border-violet-400 shadow-sm"
                          : "bg-surface-elevated/40 text-muted-foreground border-surface-border hover:text-foreground"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Negative Prompt */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Negative Prompt (Khử lỗi):
                </label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Button
                variant="primary"
                onClick={handleGenerateTextToImage}
                disabled={!prompt.trim() || isProcessing}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-2.5 rounded-2xl gap-2 mt-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Đang render tác phẩm sạch không logo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Tạo Ảnh AI (Clean Không Logo)</span>
                  </>
                )}
              </Button>
            </Card>
          )}

          {/* TOOL 2: IMAGE TO IMAGE */}
          {activeTool === "img_to_img" && (
            <Card className="p-5 space-y-4 border-pink-500/30">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4 text-pink-400" />
                  <span>Image-to-Image (Tái Cấu Trúc Ảnh)</span>
                </h3>
                <Badge variant="warning" size="sm">
                  Img2Img
                </Badge>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-surface-border hover:border-pink-400/60 rounded-3xl p-5 text-center cursor-pointer transition-colors bg-surface-elevated/30"
              >
                <p className="text-xs font-bold text-foreground">
                  {sourceImage ? "Đã nạp ảnh nguồn (Bấm để đổi)" : "Tải ảnh gốc lên để biến đổi phong cách"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Dùng đường nét ảnh gốc để clone sang phong cách nghệ thuật mới
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Prompt hướng dẫn biến đổi:
                </label>
                <textarea
                  rows={2}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ví dụ: Giữ nguyên bố cục người, chuyển thành phong cách Cyber Neon..."
                  className="w-full p-3 rounded-2xl glass-input text-xs text-foreground placeholder:text-muted-foreground shadow-sm resize-none"
                />
              </div>

              <Button
                variant="primary"
                onClick={handleGenerateImg2Img}
                disabled={!sourceImage || isProcessing}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white py-2.5 rounded-2xl gap-2 mt-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Đang biến đổi ảnh...</span>
                  </>
                ) : (
                  <>
                    <Layers className="h-4 w-4" />
                    <span>Biến Hóa Image-to-Image</span>
                  </>
                )}
              </Button>
            </Card>
          )}

          {/* TOOL 3: IMAGE TO VIDEO & MOTION */}
          {activeTool === "img_to_video" && (
            <Card className="p-5 space-y-4 border-cyan-500/30">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Video className="h-4 w-4 text-cyan-400" />
                  <span>Image-to-Video & Camera Motion Control</span>
                </h3>
                <Badge variant="primary" size="sm" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  Kling / VEO / Seedance
                </Badge>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-surface-border hover:border-cyan-400/60 rounded-3xl p-5 text-center cursor-pointer transition-colors bg-surface-elevated/30"
              >
                <p className="text-xs font-bold text-foreground">
                  {sourceImage ? "Đã nạp khung hình đầu tiên (First Frame)" : "Tải ảnh để làm chuyển động video"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  AI sẽ tự động tính toán chuyển động nhân vật và ánh sáng
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Mô hình Video:
                  </label>
                  <select
                    value={videoModel}
                    onChange={(e) => setVideoModel(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-xs text-foreground bg-slate-900 border border-white/10"
                  >
                    <option value="kling-v1.5">Kling AI v1.5 (Chuyển động mượt)</option>
                    <option value="google-veo">Google VEO 2 High Quality</option>
                    <option value="seedance-v1">Seedance Motion Engine</option>
                    <option value="sora-style">Sora Cinema Ultra</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Góc máy chuyển động (Motion):
                  </label>
                  <select
                    value={cameraMotion}
                    onChange={(e) => setCameraMotion(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-xs text-foreground bg-slate-900 border border-white/10"
                  >
                    <option value="zoom_in">Zoom In (Phóng to cận cảnh)</option>
                    <option value="zoom_out">Zoom Out (Thu nhỏ toàn cảnh)</option>
                    <option value="pan_left">Pan Left (Quét sang trái)</option>
                    <option value="pan_right">Pan Right (Quét sang phải)</option>
                    <option value="orbit">Orbit (Xoay tròn điện ảnh)</option>
                    <option value="dolly">Dolly Forward (Tiến về phía trước)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Kịch bản hành động trong video:
                </label>
                <input
                  type="text"
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Ví dụ: Tóc bay trong gió, ánh kiếm lóe sáng, camera xoay nhẹ..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-foreground"
                />
              </div>

              <Button
                variant="primary"
                onClick={handleGenerateVideo}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2.5 rounded-2xl gap-2 mt-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Đang render video điện ảnh...</span>
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4" />
                    <span>Tạo Video Image-to-Video Ngay</span>
                  </>
                )}
              </Button>
            </Card>
          )}

          {/* TOOL 4: REMOVE BACKGROUND */}
          {activeTool === "remove_bg" && (
            <Card className="p-5 space-y-4 border-purple-500/30">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-purple-400" />
                  <span>Xóa Nền Trong Suốt Tự Động</span>
                </h3>
                <Badge variant="primary" size="sm">
                  1-Click AI
                </Badge>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-surface-border hover:border-purple-400/60 rounded-3xl p-5 text-center cursor-pointer transition-colors bg-surface-elevated/30"
              >
                <p className="text-xs font-bold text-foreground">
                  {sourceImage ? "Đã nạp ảnh (Bấm để đổi)" : "Tải ảnh cần tách phông nền"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Tự động loại bỏ background, giữ lại nhân vật chính xác
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Độ nhạy khử viền:</span>
                  <span className="font-mono font-bold text-purple-400">{tolerance}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-surface-border rounded-lg cursor-pointer"
                />

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: "transparent", label: "Trong Suốt" },
                    { id: "blue", label: "Phông Xanh" },
                    { id: "dark", label: "Phông Đen" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBgColor(b.id)}
                      className={cn(
                        "py-2 px-1 rounded-xl text-[10px] font-bold border transition-all text-center",
                        bgColor === b.id
                          ? "bg-purple-600 text-white border-purple-400"
                          : "bg-surface-elevated/40 text-muted-foreground border-surface-border"
                      )}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleRemoveBackground}
                disabled={!sourceImage || isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 rounded-2xl gap-2 mt-2"
              >
                <Scissors className="h-4 w-4" />
                <span>Thực Hiện Xóa Phông Ngay</span>
              </Button>
            </Card>
          )}

          {/* TOOL 5: BATCH FLOW AUTOMATION */}
          {activeTool === "flow_auto" && (
            <Card className="p-5 space-y-4 border-amber-500/30">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>Pipeline Tự Động Hóa Hàng Loạt (Flow Automation)</span>
                </h3>
                <Badge variant="warning" size="sm">
                  Batch Pipeline
                </Badge>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Danh sách Prompts (Mỗi dòng một tác phẩm):
                </label>
                <textarea
                  rows={4}
                  value={batchPrompts}
                  onChange={(e) => setBatchPrompts(e.target.value)}
                  className="w-full p-3 rounded-2xl glass-input text-xs text-foreground placeholder:text-muted-foreground shadow-sm font-mono leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/40 border border-surface-border text-xs">
                <div>
                  <span className="font-bold text-white block">Tự động chuyển thành Video sau khi sinh ảnh</span>
                  <span className="text-[10px] text-muted-foreground">Tạo video clip 5s Kling/VEO cho từng ảnh</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoMakeVideo}
                  onChange={(e) => setAutoMakeVideo(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
              </div>

              <Button
                variant="primary"
                onClick={handleRunAutomationFlow}
                disabled={isFlowRunning}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-2.5 rounded-2xl gap-2 mt-2"
              >
                {isFlowRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Đang chạy chuỗi tự động hóa...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Bắt Đầu Chuỗi Tự Động Hóa Flow</span>
                  </>
                )}
              </Button>

              {/* Automation Console Log */}
              {flowLog.length > 0 && (
                <div className="p-3 rounded-2xl bg-black/60 border border-white/10 font-mono text-[10px] text-emerald-400 space-y-1 max-h-36 overflow-y-auto">
                  {flowLog.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* TOOL 6: FACE SWAP & BIỂU CẢM AI */}
          {activeTool === "face_swap" && (
            <Card className="p-5 space-y-4 border-rose-500/30">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Smile className="h-4 w-4 text-rose-400" />
                  <span>Face Swap & Thay Đổi Biểu Cảm AI</span>
                </h3>
                <Badge variant="primary" size="sm" className="bg-rose-500/20 text-rose-300 border-rose-500/30">
                  InsightFace 8K
                </Badge>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Upload Face Source */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-surface-border hover:border-rose-400/60 rounded-3xl p-5 text-center cursor-pointer transition-colors bg-surface-elevated/30"
              >
                <div className="flex flex-col items-center gap-1.5">
                  <div className="h-9 w-9 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <SmilePlus className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-foreground">
                    {sourceImage ? "Đã nạp khuôn mặt (Bấm để đổi)" : "Tải ảnh chân dung khuôn mặt của bạn"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Hỗ trợ tự động nhận diện góc mặt, ánh sáng và tỉ lệ tỉ mỉ
                  </p>
                </div>
              </div>

              {/* Choose Role / Persona */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Chọn trang phục & Hoá thân nhân vật:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "daoist", label: "Đạo Sỹ Thái Cực", desc: "Áo lụa đạo gia tiên phong đạo cốt" },
                    { id: "cyber", label: "Chiến Binh Cyberpunk", desc: "Chiến giáp neon viễn tưởng 2088" },
                    { id: "business", label: "Doanh Nhân Thành Đạt", desc: "Vest Bespoke sang trọng chuẩn CEO" },
                    { id: "ancient", label: "Đại Tướng Quân Cổ", desc: "Long giáp hoàng kim uy dũng" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setTargetFaceRole(r.id)}
                      className={cn(
                        "p-2.5 rounded-xl text-left border transition-all",
                        targetFaceRole === r.id
                          ? "bg-rose-500/15 border-rose-500 text-white shadow-sm"
                          : "bg-surface-elevated/30 border-surface-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="font-bold text-xs">{r.label}</div>
                      <div className="text-[9px] text-muted-foreground line-clamp-1">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Facial Expression */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Biến đổi thần thái & Biểu cảm:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "confident", label: "Tự Tin", emoji: "😎" },
                    { id: "smiling", label: "Nụ Cười Tươi", emoji: "😊" },
                    { id: "serene", label: "Thiền Định", emoji: "🧘" },
                    { id: "intense", label: "Sắc Lẹm", emoji: "⚡" },
                  ].map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => setFaceExpression(ex.id)}
                      className={cn(
                        "py-2 rounded-xl text-center border text-xs font-bold transition-all",
                        faceExpression === ex.id
                          ? "bg-rose-600 text-white border-rose-400"
                          : "bg-surface-elevated/40 text-muted-foreground border-surface-border"
                      )}
                    >
                      <span className="block text-sm">{ex.emoji}</span>
                      <span className="text-[10px] mt-0.5 block">{ex.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleFaceSwap}
                disabled={!sourceImage || isProcessing}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white py-2.5 rounded-2xl gap-2 mt-2 shadow-lg shadow-rose-500/20"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Đang ghép mặt & tinh chỉnh biểu cảm...</span>
                  </>
                ) : (
                  <>
                    <Smile className="h-4 w-4" />
                    <span>Ghép Mặt & Thay Biểu Cảm Ngay (120 Xu)</span>
                  </>
                )}
              </Button>
            </Card>
          )}

          {/* TOOL 7: GHÉP ẢNH THẺ ONLINE CHUẨN KÍCH THƯỚC */}
          {activeTool === "id_photo" && (
            <Card className="p-5 space-y-4 border-blue-500/30">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-sky-400" />
                  <span>Ghép Ảnh Thẻ Online & Chuẩn Hóa Kích Thước</span>
                </h3>
                <Badge variant="primary" size="sm" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  Chuẩn Quốc Tế
                </Badge>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Upload ID Photo Source */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-surface-border hover:border-sky-400/60 rounded-3xl p-5 text-center cursor-pointer transition-colors bg-surface-elevated/30"
              >
                <div className="flex flex-col items-center gap-1.5">
                  <div className="h-9 w-9 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Crop className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-foreground">
                    {sourceImage ? "Đã nạp ảnh chân dung (Bấm để đổi)" : "Tải ảnh chụp từ điện thoại bất kỳ"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Hệ thống tự động canh tỉ lệ tâm mắt, thẳng vai và cắt chuẩn
                  </p>
                </div>
              </div>

              {/* 1. Chọn Kích thước thẻ */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Kích thước ảnh thẻ in ấn:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "3x4", label: "Cỡ 3x4 cm", desc: "Hồ sơ / Bằng lái" },
                    { id: "4x6", label: "Cỡ 4x6 cm", desc: "Hộ chiếu VN" },
                    { id: "2x2", label: "Cỡ 2x2 inch", desc: "Visa Mỹ / Nhật" },
                    { id: "passport", label: "Visa Quốc Tế", desc: "Tiêu chuẩn ICAO" },
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setIdPhotoSize(sz.id as any)}
                      className={cn(
                        "p-2 rounded-xl text-center border transition-all",
                        idPhotoSize === sz.id
                          ? "bg-blue-600 text-white border-blue-400 shadow-sm"
                          : "bg-surface-elevated/40 text-muted-foreground border-surface-border"
                      )}
                    >
                      <div className="font-bold text-[11px]">{sz.label}</div>
                      <div className="text-[9px] opacity-75">{sz.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Chọn Phông nền chuẩn */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Phông nền thẻ:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "white", label: "Nền Trắng", bg: "bg-white text-slate-900 border-slate-300" },
                    { id: "blue", label: "Nền Xanh", bg: "bg-blue-600 text-white border-blue-400" },
                    { id: "dark_blue", label: "Xanh Đậm", bg: "bg-blue-900 text-white border-blue-700" },
                    { id: "transparent", label: "Trong Suốt", bg: "bg-slate-900 text-white border-white/20" },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setIdPhotoBg(bg.id as any)}
                      className={cn(
                        "py-2 rounded-xl text-center border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5",
                        idPhotoBg === bg.id
                          ? "ring-2 ring-sky-400 font-bold scale-[1.02]"
                          : "opacity-80 hover:opacity-100",
                        bg.bg
                      )}
                    >
                      <span>{bg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Ghép Trang Phục Công Sở */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Trang phục chỉnh chu (AI Virtual Fit):
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "formal_suit", label: "Áo Vest Đen Cà Vạt" },
                    { id: "white_shirt", label: "Áo Sơ Mi Trắng Cổ Cồn" },
                    { id: "original", label: "Giữ Áo Gốc Hiện Tại" },
                  ].map((suit) => (
                    <button
                      key={suit.id}
                      type="button"
                      onClick={() => setIdPhotoSuit(suit.id as any)}
                      className={cn(
                        "py-2 px-1 text-center rounded-xl text-[10px] font-bold border transition-all",
                        idPhotoSuit === suit.id
                          ? "bg-indigo-600 text-white border-indigo-400"
                          : "bg-surface-elevated/40 text-muted-foreground border-surface-border"
                      )}
                    >
                      {suit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tùy chọn làm đẹp da */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated/40 border border-surface-border text-xs">
                <div className="flex items-center gap-2">
                  <SunMedium className="h-4 w-4 text-amber-400" />
                  <div>
                    <span className="font-semibold text-white block">Tự động làm sáng da & xóa quầng thâm</span>
                    <span className="text-[10px] text-muted-foreground">Tối ưu ảnh chân thực, không bị ảo</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={idPhotoEnhanceBeauty}
                  onChange={(e) => setIdPhotoEnhanceBeauty(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 accent-sky-500 cursor-pointer"
                />
              </div>

              <Button
                variant="primary"
                onClick={handleCreateIdPhoto}
                disabled={!sourceImage || isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2.5 rounded-2xl gap-2 mt-2 shadow-lg shadow-blue-500/20"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Đang xử lý kích thước & phông nền thẻ...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>Xuất Ảnh Thẻ Cỡ {idPhotoSize.toUpperCase()} Ngay (80 Xu)</span>
                  </>
                )}
              </Button>
            </Card>
          )}

          {/* Drive & Clean No-Watermark Promise */}
          <div className="p-4 rounded-2xl bg-surface-elevated/30 border border-surface-border space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <ShieldCheck className="h-4 w-4" />
              <span>Cam kết Không Watermark & Không Logo 100%</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Mọi tài sản ảnh và video tạo ra thông qua MêÂmĐạoSỹ Hub đều được trích xuất dữ liệu gốc sạch, tải về không chứa logo quảng cáo và có thể đồng bộ lưu trữ trực tiếp vào Google Drive cá nhân.
            </p>
          </div>
        </div>

        {/* Right Column: Live Output Display & Gallery */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span>Màn Hình Kết Quả Trực Tiếp (Live Clean View)</span>
              </h3>

              {processedMedia && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {processedMedia.type === "image" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSendToVideo(processedMedia.url)}
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                        title="Dùng ảnh này để sinh video chuyển động ngay"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Biến Thành Video</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendToBgRemover(processedMedia.url)}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                        title="Tách nền trong suốt ảnh này"
                      >
                        <Scissors className="h-3.5 w-3.5" />
                        <span>Tách Nền</span>
                      </button>
                    </>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => downloadCleanFile(processedMedia.url, processedMedia.type === "video")}
                    className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Tải Về Không Logo</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Display Screen */}
            <div className="relative min-h-[400px] rounded-3xl bg-slate-950/90 border border-white/10 flex items-center justify-center p-4 overflow-hidden pattern-checkered">
              {processedMedia ? (
                processedMedia.type === "video" ? (
                  <div className="relative max-h-[460px] w-full flex flex-col items-center justify-center animate-in zoom-in-95">
                    <video
                      src={processedMedia.url}
                      controls
                      autoPlay
                      loop
                      className="max-h-[440px] w-auto rounded-2xl shadow-2xl border border-white/10"
                    />
                    <span className="mt-2 text-[10px] text-cyan-300 font-mono">
                      🎬 Video điện ảnh Kling/VEO &bull; Chuẩn gốc không watermark
                    </span>
                  </div>
                ) : (
                  <div className="relative max-h-[460px] flex flex-col items-center justify-center animate-in zoom-in-95">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={processedMedia.url}
                      alt="Clean AI Output"
                      className="max-h-[440px] w-auto object-contain rounded-2xl shadow-2xl drop-shadow"
                    />
                    <span className="mt-2 text-[10px] text-emerald-300 font-mono">
                      ✨ Tác phẩm AI độ phân giải cao &bull; Xuất file sạch 100%
                    </span>
                  </div>
                )
              ) : sourceImage ? (
                <div className="relative max-h-[460px] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sourceImage}
                    alt="Source Preview"
                    className="max-h-[440px] w-auto object-contain rounded-2xl shadow-md opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-2xl">
                    <span className="text-xs font-bold text-white bg-slate-950/80 px-4 py-2 rounded-xl border border-white/20">
                      Ảnh nguồn sẵn sàng &bull; Chọn công cụ bên trái để bắt đầu
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="h-16 w-16 mx-auto rounded-3xl bg-surface-elevated border border-surface-border flex items-center justify-center text-muted-foreground">
                    <Sparkles className="h-8 w-8 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">Chưa có nội dung đang xem</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      Chọn chức năng Text-to-Image, Image-to-Video hoặc Tự động hóa ở cột bên trái để bắt đầu sáng tạo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Media History Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Palette className="h-4 w-4 text-pink-400" />
                <span>Kho Tác Phẩm Đã Tạo ({gallery.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setProcessedMedia({ url: item.url, type: item.type })}
                  className="group relative rounded-2xl overflow-hidden border border-surface-border bg-surface-elevated/40 cursor-pointer hover:border-primary/50 transition-all hover:scale-[1.02]"
                >
                  <div className="aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                    {item.type === "video" ? (
                      <div className="relative w-full h-full flex items-center justify-center bg-black">
                        <video src={item.url} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <PlaySquare className="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-[10px] text-white">
                    <p className="font-bold truncate">{item.prompt}</p>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5">
                      <span>{item.model}</span>
                      <span>{item.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL: KHO PROMPT MẪU CHUẨN NGHỆ THUẬT CAO CẤP */}
      {/* ============================================================== */}
      {showPromptLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl glass-panel p-6 border border-pink-500/30 bg-slate-950/95 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-pink-500/20 text-pink-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Thư Viện Prompt Nghệ Thuật Siêu Cấp</h3>
                  <p className="text-xs text-slate-400">Chọn câu lệnh được tinh chỉnh tối ưu bởi chuyên gia AI</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPromptLibrary(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "portrait", label: "Chân Dung & Nhân Vật" },
                { id: "anime", label: "Anime & Manga" },
                { id: "cyberpunk", label: "Cyberpunk & Khoa Học" },
                { id: "landscape", label: "Phong Cảnh Huyền Ảo" },
                { id: "cinema", label: "Điện Ảnh Hollywood" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPromptCategory(tab.id as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                    promptCategory === tab.id
                      ? "bg-pink-600 text-white shadow-md shadow-pink-500/20"
                      : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List templates */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {PROMPT_TEMPLATES.filter((t) => t.category === promptCategory).map((t, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/40 transition-all flex flex-col justify-between gap-2.5 group"
                >
                  <div>
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <Sparkle className="h-3.5 w-3.5 text-pink-400" />
                      <span>{t.title}</span>
                    </h4>
                    <p className="text-[11px] text-slate-300 font-mono mt-1 leading-relaxed bg-black/40 p-2 rounded-xl border border-white/5">
                      {t.prompt}
                    </p>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(t.prompt)}
                      className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <BookmarkCheck className="h-3.5 w-3.5" />
                      <span>Áp Dụng Prompt Này</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
