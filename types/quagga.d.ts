declare module 'quagga' {
  interface QuaggaConfig {
    inputStream: {
      name: string;
      type: string;
      target: string;
      constraints: {
        facingMode: string;
      };
    };
    decoder: {
      readers: string[];
    };
    locate: boolean;
  }

  interface CodeResult {
    code: string;
    format: string;
  }

  interface DetectedResult {
    codeResult: CodeResult;
  }

  function init(config: QuaggaConfig, callback: (err: any) => void): void;
  function start(): void;
  function stop(): void;
  function onDetected(callback: (result: any) => void): void;

  export = Quagga;
}
