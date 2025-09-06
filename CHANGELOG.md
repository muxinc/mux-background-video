# 0.1.0 (2025-09-06)


### Bug Fixes

* add buffer eviction comment ([f38cb0a](https://github.com/muxinc/mux-background-video/commit/f38cb0a89a9a02d67d193dd1a30a4890126b541e))
* add buffering logic to media source ([52c2a1d](https://github.com/muxinc/mux-background-video/commit/52c2a1d5c5f7def58a0959da2846d194acc42baf))
* add evict & playhead buffer logic ([aa4e8b9](https://github.com/muxinc/mux-background-video/commit/aa4e8b9ae15d0c1e2956d27463cd9e6db9c055a2))
* add getContiguousBufferedEnd test ([c57ca6c](https://github.com/muxinc/mux-background-video/commit/c57ca6c959ef1515fd8217432c2b121353093e5b))
* add getSegmentsToLoad test ([f4d21f9](https://github.com/muxinc/mux-background-video/commit/f4d21f9e7bcdcf31a3f9d8ee3731aabf9888db9a))
* add muted flag that omits audio track ([e99c531](https://github.com/muxinc/mux-background-video/commit/e99c531bbb1c87b24bc0a6e1d940442e6344d88f))
* add Nextjs example and move Vercel example ([d402c2e](https://github.com/muxinc/mux-background-video/commit/d402c2eeafc8372f935e0b717ccb05217835c765))
* check media source state before appending ([c878717](https://github.com/muxinc/mux-background-video/commit/c878717bda444eaaaab3e41f0da71469fa9b5b01))
* cleanup ([71ee9b0](https://github.com/muxinc/mux-background-video/commit/71ee9b0fb021f77c3e7fcf26af2f68ecfb26b851))
* cleanup issue and race conditions ([58a72a5](https://github.com/muxinc/mux-background-video/commit/58a72a5441b905f69902fee29a669fffbdd0d7a1))
* favicon issue ([191106c](https://github.com/muxinc/mux-background-video/commit/191106c088a10bb77c1a15708a0f2ae0d6ac29c8))
* improve endOfStream logic ([d248f08](https://github.com/muxinc/mux-background-video/commit/d248f08f6269d975259c9fdc3e2ea3d148c78aac))
* improve types ([5e98b6c](https://github.com/muxinc/mux-background-video/commit/5e98b6cc8a65ebabf1a569d15897250c7df16de6))
* make maxResolution param work ([f52b534](https://github.com/muxinc/mux-background-video/commit/f52b53476946ccebc39b39c0ead53b2406d73fc0))
* re-organize code ([a1650a0](https://github.com/muxinc/mux-background-video/commit/a1650a09edfa56732319fafc36e87c8f93c82c02))
* remove not yet needed option ([5522e3c](https://github.com/muxinc/mux-background-video/commit/5522e3cddc2841e3bd414af81751b5ed3e60b3ed))
* rename and reorder ([bb49577](https://github.com/muxinc/mux-background-video/commit/bb495778150801ec8432cebd3a4f0dc5035bf151))
* rename project to mux-background-video ([529273a](https://github.com/muxinc/mux-background-video/commit/529273a6521a062f234fb38896004cd5d345ca0f))
* update package.json ([1da1735](https://github.com/muxinc/mux-background-video/commit/1da17356a7885ca764ca92ea6c8918fd975f84ee))


### Features

* add audio option to background video ([82dc900](https://github.com/muxinc/mux-background-video/commit/82dc9009c7a081b5c59b5254e76d0cd4f7722ad2)), closes [#2](https://github.com/muxinc/mux-background-video/issues/2)
* add chunked stream iterable ([1eed2e0](https://github.com/muxinc/mux-background-video/commit/1eed2e0ecc43666d6ffb2e1e769a574041d7c90b))
* add debug option ([#18](https://github.com/muxinc/mux-background-video/issues/18)) ([ee06395](https://github.com/muxinc/mux-background-video/commit/ee06395932ce8a4c0a2f1a425b48c759a12bd465)), closes [#17](https://github.com/muxinc/mux-background-video/issues/17)
* add fallback for MediaSource ([e2cde29](https://github.com/muxinc/mux-background-video/commit/e2cde293da85200c2db77648acbb4589f84b3c28)), closes [#11](https://github.com/muxinc/mux-background-video/issues/11)
* add fetchWithRetry utility ([#13](https://github.com/muxinc/mux-background-video/issues/13)) ([70e8360](https://github.com/muxinc/mux-background-video/commit/70e8360472fb15f644b8363824c5b9ab1ec5d7e7)), closes [#4](https://github.com/muxinc/mux-background-video/issues/4)
* add img child support ([#16](https://github.com/muxinc/mux-background-video/issues/16)) ([0bb9478](https://github.com/muxinc/mux-background-video/commit/0bb947832696624c8e9e3cf8de20d3ce767209ca)), closes [#14](https://github.com/muxinc/mux-background-video/issues/14)
* add mux data to background video ([#8](https://github.com/muxinc/mux-background-video/issues/8)) ([571e91b](https://github.com/muxinc/mux-background-video/commit/571e91bc347ad78f84a9f55ce245ab12bf4a1fd8)), closes [#5](https://github.com/muxinc/mux-background-video/issues/5)
* add preload support ([#7](https://github.com/muxinc/mux-background-video/issues/7)) ([b1a71c7](https://github.com/muxinc/mux-background-video/commit/b1a71c7c4689045c36bb8eeba5c0ce27bfeb6870)), closes [#3](https://github.com/muxinc/mux-background-video/issues/3)
* add requestLoad to MediaRenderer ([0c1845f](https://github.com/muxinc/mux-background-video/commit/0c1845f279cddcb4ed3ff6e150a566388d39ca5d)), closes [#1](https://github.com/muxinc/mux-background-video/issues/1)
* add shadow dom to web component ([19a41b1](https://github.com/muxinc/mux-background-video/commit/19a41b17c654072585fcc5bf920dea2526d5bab6))
* improve loadMedia, add custom element ([53002f1](https://github.com/muxinc/mux-background-video/commit/53002f15b7787f45394e7c4dbccf29794223cc7f))
* support managed media source for iOS 17+ ([#12](https://github.com/muxinc/mux-background-video/issues/12)) ([a4a3171](https://github.com/muxinc/mux-background-video/commit/a4a317136a6ab83f0389ec2790d8aecba4f27510)), closes [#10](https://github.com/muxinc/mux-background-video/issues/10)



