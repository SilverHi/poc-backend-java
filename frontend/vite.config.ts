import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    
    // 路径别名配置
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@store': path.resolve(__dirname, 'src/store'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@types': path.resolve(__dirname, 'src/types'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@styles': path.resolve(__dirname, 'src/styles'),
      },
    },
    
    // 开发服务器配置
    server: {
      port: 3000,
      open: true,
      host: true, // 允许外部访问
      cors: true, // 启用 CORS
      proxy: {
        // API 代理配置
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    
    // 构建配置
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development', // 开发环境生成 sourcemap
      minify: 'terser', // 使用 terser 进行压缩
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // 生产环境移除 console
          drop_debugger: mode === 'production', // 生产环境移除 debugger
        },
      },
      rollupOptions: {
        output: {
          // 代码分割配置
          manualChunks: {
            vendor: ['react', 'react-dom'],
            redux: ['@reduxjs/toolkit', 'react-redux'],
            router: ['react-router-dom'],
          },
          // 文件名配置
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
      // 构建目标
      target: 'es2015',
      // 构建大小警告阈值
      chunkSizeWarningLimit: 1000,
    },
    
    // CSS 配置
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          // 修改antd主题
          modifyVars: {
            '@primary-color': '#1890ff',
            '@link-color': '#1890ff',
            '@success-color': '#52c41a',
            '@warning-color': '#faad14',
            '@error-color': '#f5222d',
          },
        },
      },
      // CSS 代码分割
      postcss: {
        plugins: [
          require('autoprefixer'),
          require('tailwindcss'),
        ],
      },
    },
    
    // 依赖预构建配置
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@reduxjs/toolkit',
        'react-redux',
        'react-router-dom',
        'antd',
        'axios'
      ],
    },
    
    // 环境变量定义
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    
    // 静态资源处理
    publicDir: 'public',
    
    // 预览配置
    preview: {
      port: 4173,
      open: true,
    },
  };
}); 