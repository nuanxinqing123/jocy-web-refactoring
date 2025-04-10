import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vitePluginBundleObfuscator from "vite-plugin-bundle-obfuscator";
import path from 'path'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
    build: {
        outDir: "dist",
        assetsDir: "assets", //指定静态资源存放路径
        minify: "esbuild", // 默认
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name].[hash].js`,
                chunkFileNames: `assets/[name].[hash].js`,
                assetFileNames: "assets/[ext]/[hash].[ext]",
            },
        }, // 打包后文件的存放路径
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    esbuild: {
        drop: ["console", "debugger"], //打包去除
    },
    server: {
        //设为 true 时若端口已被占用则会直接退出，而不是尝试下一个可用端口
        strictPort: false,
        //服务器启动时自动在浏览器中打开应用程序,当此值为字符串时，会被用作 URL 的路径名
        open: true,
        port: 3000,
        cors: true,
        proxy: {
            '/api': {
                target: 'https://api.example.com', // 替换为实际的API地址
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    define: {
        'process.env': {
            BASE_API: '',
        },
    },
    plugins: [
        vue(),
        // 暂时禁用混淆插件以测试启动问题
        // vitePluginBundleObfuscator({
        //     excludes: ["*.css"],
        //     enable: true,
        //     log: true,
        //     autoExcludeNodeModules: false,
        //     threadPool: false,
        //     options: {
        //         compact: true,
        //         controlFlowFlattening: true,
        //         controlFlowFlatteningThreshold: 1,
        //         deadCodeInjection: false,
        //         debugProtection: false,
        //         debugProtectionInterval: 0,
        //         disableConsoleOutput: false,
        //         identifierNamesGenerator: "hexadecimal",
        //         log: false,
        //         numbersToExpressions: false,
        //         renameGlobals: false,
        //         selfDefending: true,
        //         simplify: true,
        //         splitStrings: false,
        //         stringArray: false,
        //         stringArrayCallsTransform: false,
        //         stringArrayCallsTransformThreshold: 0.5,
        //         stringArrayEncoding: [],
        //         stringArrayIndexShift: true,
        //         stringArrayRotate: true,
        //         stringArrayShuffle: true,
        //         stringArrayWrappersCount: 1,
        //         stringArrayWrappersChainedCalls: true,
        //         stringArrayWrappersParametersMaxCount: 2,
        //         stringArrayWrappersType: "variable",
        //         stringArrayThreshold: 0.75,
        //         unicodeEscapeSequence: false,
        //     },
        // }),
    ],
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
                additionalData: `@color: #f596aa;`
            }
        }
    }
})
