/**
 * Copyright (c) 2018-present, SanQiu, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Create by mark on 2019/12/19.
 * @emails a9mm51@gmail.com
 */

import ACSpeedTestModel from './ACSpeedTestModel';

const INDEX_NOT_FOUND = -1;

export default class ACHostSpeedModel {

    constructor(hosts) {
        // 复制hosts
        this._hosts = [...hosts];
        // 随机一下避免大量请求同一时间请求同一台服务器
        this._hosts = this._hosts.sort(this._random);
        this.speedTestModel = new ACSpeedTestModel();
    }

    removeInvalidHost(host) {
        const index = this._hosts.indexOf(host);
        if (index !== INDEX_NOT_FOUND) {
            this._hosts.splice(index, 1);
        }
    }

    async getFastest() {
        try {
            // 第一次请求最快Host，如果有直接返回
            const fastestResult = await this.speedTestModel.testFastest(this._hosts);
            if (fastestResult) {
                if (fastestResult.available && fastestResult.delay < 1000) {
                    return fastestResult;
                } else {
                    this.removeInvalidHost(fastestResult.host);
                }
            }
            // 进行第二次请求最快Host，如果有直接返回
            const fastestResult2 = await this.speedTestModel.testFastest(this._hosts);
            if (fastestResult2) {
                if (fastestResult2.available && fastestResult2.delay < 2000) {
                    return fastestResult2;
                } else {
                    this.removeInvalidHost(fastestResult2.host);
                }
            }
            // 进行第三次请求最快Host，如果有直接返回
            const fastestResult3 = await this.speedTestModel.testFastest(this._hosts);
            if (fastestResult3) {
                if (fastestResult3.available && fastestResult3.delay < 2000) {
                    return fastestResult3;
                } else {
                    this.removeInvalidHost(fastestResult3.host);
                }
            }
            // 三次请求最快Host失败后，把所有Host按访问速度排序
            const sortedResults = await this.sortByAccessSpeed();
            if (sortedResults.length === 0) {
                return undefined;
            }
            // 返回第一个即是最快的
            return sortedResults[0];
        } catch (error) {
            console.log(`----------------------------------- error.message :: ${error.message} \n\n`);
            throw error;
        }
    }

    async testSpecificHost(host) {
        return this.speedTestModel.testHost(host);
    }

    async sortByAccessSpeed() {
        const results = await this.speedTestModel.testAll(this._hosts);
        const availableResults = results.filter(result => result.available);
        if (availableResults.length === 0) {
            return [];
        }
        return availableResults.sort((result1, result2) => {
            // 按延迟从低到高排序
            return result1.delay - result2.delay;
        });
    }

    _random = () => Math.random() > 0.5;

}
