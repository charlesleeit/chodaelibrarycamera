declare module 'quagga' {
  interface QuaggaConfig {
    inputStream: {
      name: string;
      type: string;
      constraints?: {
        width?: number;
        height?: number;
        facingMode?: string;
      };
      area?: {
        top?: string;
        right?: string;
        left?: string;
        bottom?: string;
      };
    };
    locator: {
      patchSize: string;
      halfSample: boolean;
    };
    numOfWorkers: number;
    frequency: number;
    decoder: {
      readers: string[];
    };
    locate: boolean;
  }

  interface QuaggaResult {
    codeResult: {
      code: string;
      format: string;
    };
  }

  function init(config: QuaggaConfig, callback: (err: any) => void): void;
  function start(): void;
  function stop(): void;
  function decodeSingle(config: QuaggaConfig, callback: (result: QuaggaResult) => void): void;
  function onDetected(callback: (result: QuaggaResult) => void): void;
  function onProcessed(callback: (result: any) => void): void;

  export = Quagga;
}
