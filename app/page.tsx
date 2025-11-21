'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// 停電情報のサンプルデータ
const outageData = [
  {
    id: 1,
    location: '東京都渋谷区',
    lat: 35.6595,
    lng: 139.7004,
    affectedHouses: 120,
    status: '復旧作業中',
    estimatedRecovery: '14:00'
  },
  {
    id: 2,
    location: '東京都新宿区',
    lat: 35.6938,
    lng: 139.7036,
    affectedHouses: 85,
    status: '調査中',
    estimatedRecovery: '未定'
  },
  {
    id: 3,
    location: '神奈川県横浜市',
    lat: 35.4437,
    lng: 139.6380,
    affectedHouses: 230,
    status: '復旧済み',
    estimatedRecovery: '-'
  },
  {
    id: 4,
    location: '千葉県千葉市',
    lat: 35.6074,
    lng: 140.1065,
    affectedHouses: 45,
    status: '復旧作業中',
    estimatedRecovery: '15:30'
  },
];

// 地図コンポーネント（動的インポート用）
function MapComponent() {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current || mapRef.current) return;

    // 動的にLeafletをインポート
    import('leaflet').then((L) => {
      // Leaflet CSSを動的にインポート
      import('leaflet/dist/leaflet.css' as any);

      if (!mapContainerRef.current || mapRef.current) return;

      // 地図の初期化
      const map = L.map(mapContainerRef.current).setView([35.6812, 139.7671], 10);
      mapRef.current = map;

      // OpenStreetMapタイルレイヤーの追加
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // カスタムアイコンの作成
      const createIcon = (status: string) => {
        const color = status === '復旧済み' ? '#22c55e' :
          status === '復旧作業中' ? '#f59e0b' : '#ef4444';

        return L.divIcon({
          className: 'custom-icon',
          html: `<div style="
            background-color: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          ">⚡</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
      };

      // 停電情報マーカーの追加
      outageData.forEach((outage) => {
        const marker = L.marker([outage.lat, outage.lng], {
          icon: createIcon(outage.status),
        }).addTo(map);

        // ポップアップの内容
        marker.bindPopup(`
          <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: bold; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
              📍 ${outage.location}
            </h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <p style="margin: 0; display: flex; justify-content: space-between;">
                <strong style="color: #6b7280;">影響戸数:</strong> 
                <span style="color: #1f2937;">約${outage.affectedHouses}戸</span>
              </p>
              <p style="margin: 0; display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #6b7280;">状態:</strong> 
                <span style="
                  padding: 3px 10px;
                  border-radius: 12px;
                  font-size: 13px;
                  font-weight: 600;
                  background-color: ${outage.status === '復旧済み' ? '#dcfce7' :
            outage.status === '復旧作業中' ? '#fef3c7' : '#fee2e2'};
                  color: ${outage.status === '復旧済み' ? '#16a34a' :
            outage.status === '復旧作業中' ? '#d97706' : '#dc2626'};
                ">
                  ${outage.status}
                </span>
              </p>
              <p style="margin: 0; display: flex; justify-content: space-between;">
                <strong style="color: #6b7280;">復旧予定:</strong> 
                <span style="color: #1f2937;">${outage.estimatedRecovery}</span>
              </p>
            </div>
          </div>
        `);
      });
    });

    // クリーンアップ
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={mapContainerRef} style={{ flex: 1 }} />;
}

// SSRを無効化して地図コンポーネントを動的インポート
const DynamicMap = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => (
    <div style={{
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f3f4f6',
      fontSize: '16px',
      color: '#6b7280'
    }}>
      🗺️ 地図を読み込み中...
    </div>
  ),
});

export default function Home() {
  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <header style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '16px 24px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          ⚡ 停電情報マップ
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
          リアルタイムの停電状況を確認できます
        </p>
      </header>

      {/* 凡例 */}
      <div style={{
        backgroundColor: 'white',
        padding: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '24px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}></div>
          <span style={{ fontSize: '14px' }}>調査中</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#f59e0b',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}></div>
          <span style={{ fontSize: '14px' }}>復旧作業中</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}></div>
          <span style={{ fontSize: '14px' }}>復旧済み</span>
        </div>
      </div>

      {/* 地図（動的インポート） */}
      <DynamicMap />

      {/* フッター */}
      <footer style={{
        backgroundColor: '#f3f4f6',
        padding: '8px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        最終更新: {new Date().toLocaleString('ja-JP')}
      </footer>
    </div>
  );
}