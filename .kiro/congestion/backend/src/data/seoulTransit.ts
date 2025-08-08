import { RouteInfo, StationInfo, TransportType } from '../types';

// 서울 지하철 주요 역 정보
export const seoulSubwayStations: StationInfo[] = [
  // 1호선
  { id: 'seoul-station', name: '서울역', location: { lat: 37.5546, lng: 126.9707 }, facilities: ['환승', '화장실', '엘리베이터'] },
  { id: 'jonggak', name: '종각', location: { lat: 37.5703, lng: 126.9826 }, facilities: ['화장실', '엘리베이터'] },
  { id: 'dongdaemun', name: '동대문', location: { lat: 37.5714, lng: 127.0098 }, facilities: ['환승', '화장실'] },
  
  // 2호선
  { id: 'gangnam', name: '강남', location: { lat: 37.4979, lng: 127.0276 }, facilities: ['환승', '화장실', '엘리베이터', '스크린도어'] },
  { id: 'hongik-univ', name: '홍대입구', location: { lat: 37.5577, lng: 126.9240 }, facilities: ['환승', '화장실', '엘리베이터'] },
  { id: 'sinchon', name: '신촌', location: { lat: 37.5556, lng: 126.9364 }, facilities: ['화장실', '엘리베이터'] },
  { id: 'euljiro-1ga', name: '을지로1가', location: { lat: 37.5663, lng: 126.9820 }, facilities: ['환승', '화장실'] },
  { id: 'myeongdong', name: '명동', location: { lat: 37.5608, lng: 126.9867 }, facilities: ['화장실', '엘리베이터'] },
  
  // 3호선
  { id: 'apgujeong', name: '압구정', location: { lat: 37.5272, lng: 127.0286 }, facilities: ['화장실', '엘리베이터'] },
  { id: 'sinsa', name: '신사', location: { lat: 37.5164, lng: 127.0206 }, facilities: ['화장실'] },
  { id: 'gangnam-3', name: '강남(3호선)', location: { lat: 37.4952, lng: 127.0254 }, facilities: ['환승', '화장실', '엘리베이터'] },
  
  // 4호선
  { id: 'myeongdong-4', name: '명동(4호선)', location: { lat: 37.5608, lng: 126.9867 }, facilities: ['환승', '화장실', '엘리베이터'] },
  { id: 'dongdaemun-4', name: '동대문(4호선)', location: { lat: 37.5714, lng: 127.0098 }, facilities: ['환승', '화장실'] },
  
  // 5호선
  { id: 'yeouido', name: '여의도', location: { lat: 37.5219, lng: 126.9245 }, facilities: ['환승', '화장실', '엘리베이터'] },
  { id: 'mapo', name: '마포', location: { lat: 37.5390, lng: 126.9450 }, facilities: ['화장실'] },
  
  // 6호선
  { id: 'itaewon', name: '이태원', location: { lat: 37.5344, lng: 126.9944 }, facilities: ['화장실', '엘리베이터'] },
  { id: 'hangangjin', name: '한강진', location: { lat: 37.5326, lng: 126.9757 }, facilities: ['화장실'] },
  
  // 7호선
  { id: 'gangnam-stn', name: '강남구청', location: { lat: 37.5173, lng: 127.0417 }, facilities: ['화장실', '엘리베이터'] },
  { id: 'konkuk-univ', name: '건대입구', location: { lat: 37.5405, lng: 127.0700 }, facilities: ['환승', '화장실', '엘리베이터'] },
  
  // 8호선
  { id: 'jamsil', name: '잠실', location: { lat: 37.5133, lng: 127.1000 }, facilities: ['환승', '화장실', '엘리베이터', '스크린도어'] },
  
  // 9호선
  { id: 'gimpo-airport', name: '김포공항', location: { lat: 37.5629, lng: 126.8013 }, facilities: ['환승', '화장실', '엘리베이터', '공항연결'] },
  { id: 'yeouido-9', name: '여의도(9호선)', location: { lat: 37.5219, lng: 126.9245 }, facilities: ['환승', '화장실', '엘리베이터'] },
];

// 서울 지하철 노선 정보
export const seoulSubwayRoutes: RouteInfo[] = [
  {
    id: 'line-1',
    name: '1호선',
    transportType: 'subway' as TransportType,
    stations: seoulSubwayStations.filter(s => ['seoul-station', 'jonggak', 'dongdaemun'].includes(s.id)),
    operatingHours: { start: '05:30', end: '24:00' },
    averageInterval: 3
  },
  {
    id: 'line-2',
    name: '2호선',
    transportType: 'subway' as TransportType,
    stations: seoulSubwayStations.filter(s => ['gangnam', 'hongik-univ', 'sinchon', 'euljiro-1ga', 'myeongdong'].includes(s.id)),
    operatingHours: { start: '05:30', end: '24:00' },
    averageInterval: 2
  },
  {
    id: 'line-3',
    name: '3호선',
    transportType: 'subway' as TransportType,
    stations: seoulSubwayStations.filter(s => ['apgujeong', 'sinsa', 'gangnam-3'].includes(s.id)),
    operatingHours: { start: '05:30', end: '24:00' },
    averageInterval: 3
  },
  {
    id: 'line-4',
    name: '4호선',
    transportType: 'subway' as TransportType,
    stations: seoulSubwayStations.filter(s => ['myeongdong-4', 'dongdaemun-4'].includes(s.id)),
    operatingHours: { start: '05:30', end: '24:00' },
    averageInterval: 3
  },
  {
    id: 'line-5',
    name: '5호선',
    transportType: 'subway' as TransportType,
    stations: seoulSubwayStations.filter(s => ['yeouido', 'mapo'].includes(s.id)),
    operatingHours: { start: '05:30', end: '24:00' },
    averageInterval: 4
  },
  {
    id: 'line-6',
    name: '6호선',
    transportType: 'subway' as TransportType,
    stations: seoulSubwayStations.filter(s => ['itaewon', 'hangangjin'].includes(s.id)),
    operatingHours: { start: '05:30', end: '24:00' },
    averageInterval: 4
  },
  {
    id: 'line-7',
    name: '7호선',
    transportType: 'subway' as TransportType,
    stations: seoulSubwayStations.filter(s => ['gangnam-stn', 'konkuk-univ'].includes(s.id)),
    operatingHours: { start: '05:30', end: '24:00' },
    averageInterval: 4
  },
  {
    id: 'line-8',
    name: '8호선',
    transportType: 'subway' as TransportType,
    stations: seoulSubwayStations.filter(s => ['jamsil'].includes(s.id)),
    operatingHours: { start: '05:30', end: '24:00' },
    averageInterval: 5
  },
  {
    id: 'line-9',
    name: '9호선',
    transportType: 'subway' as TransportType,
    stations: seoulSubwayStations.filter(s => ['gimpo-airport', 'yeouido-9'].includes(s.id)),
    operatingHours: { start: '05:30', end: '24:00' },
    averageInterval: 3
  }
];

// 서울 버스 정류장 정보
export const seoulBusStations: StationInfo[] = [
  { id: 'gangnam-bus-terminal', name: '강남역버스정류장', location: { lat: 37.4979, lng: 127.0276 }, facilities: ['버스정보시스템', '벤치'] },
  { id: 'hongdae-bus-stop', name: '홍대입구역버스정류장', location: { lat: 37.5577, lng: 126.9240 }, facilities: ['버스정보시스템', '벤치', '지붕'] },
  { id: 'myeongdong-bus-stop', name: '명동역버스정류장', location: { lat: 37.5608, lng: 126.9867 }, facilities: ['버스정보시스템'] },
  { id: 'jamsil-bus-terminal', name: '잠실역버스정류장', location: { lat: 37.5133, lng: 127.1000 }, facilities: ['버스정보시스템', '벤치', '지붕'] },
  { id: 'yeouido-bus-stop', name: '여의도역버스정류장', location: { lat: 37.5219, lng: 126.9245 }, facilities: ['버스정보시스템', '벤치'] },
];

// 서울 버스 노선 정보
export const seoulBusRoutes: RouteInfo[] = [
  {
    id: 'bus-146',
    name: '146번',
    transportType: 'bus' as TransportType,
    stations: [seoulBusStations[0]!, seoulBusStations[1]!, seoulBusStations[2]!],
    operatingHours: { start: '05:00', end: '23:30' },
    averageInterval: 8
  },
  {
    id: 'bus-472',
    name: '472번',
    transportType: 'bus' as TransportType,
    stations: [seoulBusStations[1]!, seoulBusStations[3]!, seoulBusStations[4]!],
    operatingHours: { start: '05:30', end: '23:00' },
    averageInterval: 12
  },
  {
    id: 'bus-6002',
    name: '6002번(광역)',
    transportType: 'bus' as TransportType,
    stations: [seoulBusStations[0]!, seoulBusStations[4]!],
    operatingHours: { start: '05:00', end: '22:30' },
    averageInterval: 15
  }
];

// 전체 교통 정보 통합
export const allRoutes: RouteInfo[] = [...seoulSubwayRoutes, ...seoulBusRoutes];
export const allStations: StationInfo[] = [...seoulSubwayStations, ...seoulBusStations];