import { WeatherCondition } from '../types';
import { generateId, getCurrentTimestamp, getRandomElement } from '../utils/helpers';

/**
 * 날씨 데이터 인터페이스
 */
export interface WeatherData {
  id: string;
  timestamp: string;
  condition: WeatherCondition;
  temperature: number; // 섭씨
  humidity: number; // 퍼센트
  windSpeed: number; // km/h
  visibility: number; // km
  description: string;
  impact: WeatherImpact;
}

/**
 * 날씨가 교통에 미치는 영향
 */
export interface WeatherImpact {
  congestionIncrease: number; // 퍼센트
  delayProbability: number; // 0-1
  safetyLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

/**
 * 날씨 데이터 생성 서비스
 * 서울 기후 패턴을 반영한 현실적인 날씨 데이터를 생성합니다.
 */
export class WeatherGenerator {
  private readonly seasonalPatterns = {
    spring: { // 3-5월
      temperature: { min: 5, max: 25 },
      humidity: { min: 40, max: 70 },
      conditions: {
        clear: 0.35,
        cloudy: 0.30,
        rainy: 0.25,
        foggy: 0.10,
        snowy: 0.00
      }
    },
    summer: { // 6-8월
      temperature: { min: 20, max: 35 },
      humidity: { min: 60, max: 90 },
      conditions: {
        clear: 0.25,
        cloudy: 0.25,
        rainy: 0.45,
        foggy: 0.05,
        snowy: 0.00
      }
    },
    autumn: { // 9-11월
      temperature: { min: 0, max: 20 },
      humidity: { min: 45, max: 75 },
      conditions: {
        clear: 0.40,
        cloudy: 0.35,
        rainy: 0.15,
        foggy: 0.10,
        snowy: 0.00
      }
    },
    winter: { // 12-2월
      temperature: { min: -10, max: 10 },
      humidity: { min: 30, max: 60 },
      conditions: {
        clear: 0.30,
        cloudy: 0.35,
        rainy: 0.10,
        foggy: 0.15,
        snowy: 0.10
      }
    }
  };

  private readonly weatherDescriptions = {
    clear: ['맑음', '화창함', '쾌청', '맑고 따뜻함'],
    cloudy: ['흐림', '구름많음', '흐리고 습함', '구름 낀 하늘'],
    rainy: ['비', '소나기', '장마', '폭우', '이슬비', '강우'],
    snowy: ['눈', '폭설', '눈보라', '진눈깨비', '함박눈'],
    foggy: ['안개', '짙은 안개', '박무', '시야 불량']
  };

  /**
   * 현재 날씨 데이터 생성
   */
  generateCurrentWeather(): WeatherData {
    const now = new Date();
    const season = this.getCurrentSeason(now);
    const condition = this.generateWeatherCondition(season);
    
    return this.createWeatherData(condition, season, now);
  }

  /**
   * 특정 시간의 날씨 데이터 생성
   */
  generateWeatherForTime(targetTime: Date): WeatherData {
    const season = this.getCurrentSeason(targetTime);
    const condition = this.generateWeatherCondition(season);
    
    return this.createWeatherData(condition, season, targetTime);
  }

  /**
   * 날씨 예보 데이터 생성 (향후 24시간)
   */
  generateWeatherForecast(hours: number = 24): WeatherData[] {
    const forecast: WeatherData[] = [];
    const now = new Date();

    for (let i = 0; i < hours; i++) {
      const forecastTime = new Date(now.getTime() + i * 60 * 60 * 1000);
      const weatherData = this.generateWeatherForTime(forecastTime);
      forecast.push(weatherData);
    }

    return forecast;
  }

  /**
   * 극한 날씨 시뮬레이션
   */
  simulateExtremeWeather(condition: WeatherCondition, duration: number): WeatherData[] {
    const extremeWeather: WeatherData[] = [];
    const now = new Date();

    for (let i = 0; i < duration; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      const season = this.getCurrentSeason(time);
      
      let weatherData = this.createWeatherData(condition, season, time);
      
      // 극한 날씨 특성 강화
      switch (condition) {
        case 'rainy':
          weatherData.humidity = Math.min(95, weatherData.humidity + 20);
          weatherData.visibility = Math.max(1, weatherData.visibility - 3);
          weatherData.impact.congestionIncrease += 15;
          break;
        case 'snowy':
          weatherData.temperature = Math.min(0, weatherData.temperature - 5);
          weatherData.visibility = Math.max(0.5, weatherData.visibility - 4);
          weatherData.impact.congestionIncrease += 25;
          break;
        case 'foggy':
          weatherData.visibility = Math.max(0.2, weatherData.visibility - 5);
          weatherData.humidity = Math.min(98, weatherData.humidity + 25);
          weatherData.impact.congestionIncrease += 20;
          break;
      }

      extremeWeather.push(weatherData);
    }

    return extremeWeather;
  }

  // === Private Helper Methods ===

  private getCurrentSeason(date: Date): keyof typeof this.seasonalPatterns {
    const month = date.getMonth() + 1; // 0-based to 1-based
    
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  private generateWeatherCondition(season: keyof typeof this.seasonalPatterns): WeatherCondition {
    const conditions = this.seasonalPatterns[season].conditions;
    const random = Math.random();
    let cumulative = 0;

    for (const [condition, probability] of Object.entries(conditions)) {
      cumulative += probability;
      if (random <= cumulative) {
        return condition as WeatherCondition;
      }
    }

    return 'clear';
  }

  private createWeatherData(
    condition: WeatherCondition, 
    season: keyof typeof this.seasonalPatterns, 
    time: Date
  ): WeatherData {
    const seasonData = this.seasonalPatterns[season];
    
    // 기본 날씨 데이터 생성
    const temperature = this.generateTemperature(seasonData.temperature, condition);
    const humidity = this.generateHumidity(seasonData.humidity, condition);
    const windSpeed = this.generateWindSpeed(condition);
    const visibility = this.generateVisibility(condition);
    
    return {
      id: generateId('weather'),
      timestamp: time.toISOString(),
      condition,
      temperature,
      humidity,
      windSpeed,
      visibility,
      description: getRandomElement(this.weatherDescriptions[condition]),
      impact: this.calculateWeatherImpact(condition, temperature, humidity, windSpeed, visibility)
    };
  }

  private generateTemperature(range: { min: number; max: number }, condition: WeatherCondition): number {
    let baseTemp = Math.random() * (range.max - range.min) + range.min;
    
    // 날씨 조건에 따른 온도 보정
    switch (condition) {
      case 'rainy':
        baseTemp -= Math.random() * 3; // 비 오면 온도 하락
        break;
      case 'snowy':
        baseTemp = Math.min(baseTemp, 2); // 눈 오면 영하 근처
        break;
      case 'clear':
        baseTemp += Math.random() * 2; // 맑으면 약간 상승
        break;
    }

    return Math.round(baseTemp * 10) / 10; // 소수점 1자리
  }

  private generateHumidity(range: { min: number; max: number }, condition: WeatherCondition): number {
    let baseHumidity = Math.random() * (range.max - range.min) + range.min;
    
    switch (condition) {
      case 'rainy':
        baseHumidity = Math.max(baseHumidity, 70);
        break;
      case 'foggy':
        baseHumidity = Math.max(baseHumidity, 85);
        break;
      case 'clear':
        baseHumidity = Math.min(baseHumidity, 60);
        break;
    }

    return Math.round(baseHumidity);
  }

  private generateWindSpeed(condition: WeatherCondition): number {
    let baseSpeed = Math.random() * 20; // 0-20 km/h
    
    switch (condition) {
      case 'rainy':
        baseSpeed += Math.random() * 15; // 비바람
        break;
      case 'snowy':
        baseSpeed += Math.random() * 25; // 눈보라
        break;
      case 'clear':
        baseSpeed = Math.min(baseSpeed, 10); // 맑으면 바람 약함
        break;
    }

    return Math.round(baseSpeed * 10) / 10;
  }

  private generateVisibility(condition: WeatherCondition): number {
    switch (condition) {
      case 'clear':
        return Math.random() * 5 + 15; // 15-20km
      case 'cloudy':
        return Math.random() * 5 + 10; // 10-15km
      case 'rainy':
        return Math.random() * 3 + 2;  // 2-5km
      case 'snowy':
        return Math.random() * 2 + 1;  // 1-3km
      case 'foggy':
        return Math.random() * 1 + 0.5; // 0.5-1.5km
      default:
        return 10;
    }
  }

  private calculateWeatherImpact(
    condition: WeatherCondition,
    temperature: number,
    humidity: number,
    windSpeed: number,
    visibility: number
  ): WeatherImpact {
    let congestionIncrease = 0;
    let delayProbability = 0;
    let safetyLevel: 'low' | 'medium' | 'high' = 'high';
    const recommendations: string[] = [];

    switch (condition) {
      case 'clear':
        congestionIncrease = -5;
        delayProbability = 0.05;
        safetyLevel = 'high';
        recommendations.push('쾌적한 이동 날씨입니다');
        break;

      case 'cloudy':
        congestionIncrease = 0;
        delayProbability = 0.1;
        safetyLevel = 'high';
        recommendations.push('평상시와 동일한 교통 상황이 예상됩니다');
        break;

      case 'rainy':
        congestionIncrease = 15;
        delayProbability = 0.3;
        safetyLevel = 'medium';
        recommendations.push('우산을 준비하세요', '대중교통 이용을 권장합니다', '여유시간을 두고 출발하세요');
        break;

      case 'snowy':
        congestionIncrease = 25;
        delayProbability = 0.5;
        safetyLevel = 'low';
        recommendations.push('대중교통 이용을 강력히 권장합니다', '충분한 여유시간을 확보하세요', '미끄럼 주의');
        break;

      case 'foggy':
        congestionIncrease = 20;
        delayProbability = 0.4;
        safetyLevel = 'low';
        recommendations.push('시야 확보에 주의하세요', '대중교통 지연 가능성이 높습니다', '안전운행 우선');
        break;
    }

    // 극한 조건 추가 보정
    if (temperature < -5 || temperature > 35) {
      congestionIncrease += 10;
      delayProbability += 0.1;
      safetyLevel = 'low';
      recommendations.push('극한 기온으로 인한 지연 가능');
    }

    if (windSpeed > 30) {
      congestionIncrease += 15;
      delayProbability += 0.2;
      safetyLevel = 'low';
      recommendations.push('강풍으로 인한 운행 지장 가능');
    }

    if (visibility < 1) {
      congestionIncrease += 20;
      delayProbability += 0.3;
      safetyLevel = 'low';
      recommendations.push('시야 불량으로 인한 심각한 지연 예상');
    }

    return {
      congestionIncrease: Math.max(0, Math.min(50, congestionIncrease)),
      delayProbability: Math.max(0, Math.min(1, delayProbability)),
      safetyLevel,
      recommendations
    };
  }

  /**
   * 날씨 변화 시뮬레이션
   */
  simulateWeatherChange(): void {
    setInterval(() => {
      const currentWeather = this.generateCurrentWeather();
      console.log(`🌤️ Weather update: ${currentWeather.condition} ${currentWeather.temperature}°C`);
      
      // 극한 날씨 시 알림
      if (currentWeather.impact.safetyLevel === 'low') {
        console.log(`⚠️ Weather alert: ${currentWeather.description} - Safety level: ${currentWeather.impact.safetyLevel}`);
      }
    }, 30 * 60 * 1000); // 30분마다 업데이트
  }
}

// 싱글톤 인스턴스 생성
export const weatherGenerator = new WeatherGenerator();