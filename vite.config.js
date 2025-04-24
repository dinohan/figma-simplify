import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    // ES5로 트랜스파일
    target: 'es2015'
  },
  build: {
    // 번들링된 파일의 출력 디렉토리
    outDir: './',
    // 라이브러리 모드로 설정
    lib: {
      // 진입점 파일
      entry: 'code.ts',
      // 출력 파일 이름
      name: 'code',
      // 출력 파일 형식
      fileName: (_format) => `code.js`,
      // UMD 형식으로 출력 (호환성 높음)
      formats: ['umd']
    },
    // 의존성 인라인 포함
    rollupOptions: {
      external: []
    },
    // 소스맵 비활성화
    sourcemap: false,
    // 출력 파일 압축 비활성화
    minify: false
  }
}); 