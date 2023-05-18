import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"

export default defineConfig({
    base: '/tenzy-game/',
    plugins: [react()]
})