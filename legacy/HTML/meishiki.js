class Meishiki {
    constructor(birthdate, birthtime, sex) {
        // 生年月日を正確に設定（時刻は00:00:00に統一）
        // タイムゾーンの影響を避けるため、UTCで設定
        this.birthdate = new Date(Date.UTC(birthdate.getFullYear(), birthdate.getMonth(), birthdate.getDate(), 0, 0, 0, 0));
        this.birthtime = birthtime ? new Date(birthtime) : null;
        this.sex = parseInt(sex);
        this.meishiki = {};
        this.std_num = 2; // 日干を基準とする
    }

    // 天中殺（空亡）区分（10区分）
    static tenchusatsuList = [
        '戌亥', // 1～10
        '申酉', // 11～20
        '午未', // 21～30
        '辰巳', // 31～40
        '寅卯', // 41～50
        '子丑'  // 51～60
    ];

    isSetsuiri(month) {
        // 指定月と生月の大小を先に判定し、同月のときのみ日で比較する（最小限の修正）
        const birthYear = this.birthdate.getFullYear();
        const birthMonth = this.birthdate.getMonth() + 1;
        const birthDay = this.birthdate.getDate();

        if (birthMonth > month) return 0;   // その月の節入りはすでに過ぎている
        if (birthMonth < month) return -1;  // その月の節入りはまだ来ていない

        // 同月の場合のみ節入り日と比較（時刻は従来どおり不使用）
        for (const s of kanshiData.setsuiri) {
            if (s[0] === birthYear && s[1] === month) {
                const setsuiriDay = s[2];
                return birthDay >= setsuiriDay ? 0 : -1;
            }
        }
        throw new Error('節入りを判定できませんでした。');
    }

    findYearKanshi() {
        const year = this.birthdate.getFullYear();
        
        try {
            // 参考情報: 2月節入り日時と生月・生日（プロセス把握のための最小限ログ）
            const birthMonth = this.birthdate.getMonth() + 1;
            const birthDay = this.birthdate.getDate();
            let febSetsuiri = null;
            for (const s of kanshiData.setsuiri) {
                if (s[0] === year && s[1] === 2) { febSetsuiri = s; break; }
            }
            if (febSetsuiri) {
                const hh = String(febSetsuiri[3]).padStart(2, '0');
                const mm = String(febSetsuiri[3]).padStart(2, '0');
            }
            
            // 年干計算のための節入り判定を修正
            // 生年月日が2月節入り前か後かを判定する
            let setsuiriResult;
            if (febSetsuiri) {
                // 2月節入り日と生年月日を比較
                if (birthMonth < 2) {
                    // 1月生まれの場合は、2月節入り前なので前年として扱う
                    setsuiriResult = -1;
                } else if (birthMonth === 2) {
                    // 2月生まれの場合は、2月節入り日と比較
                    setsuiriResult = birthDay >= febSetsuiri[2] ? 0 : -1;
                } else {
                    // 3月以降生まれの場合は、2月節入りは過ぎている
                    setsuiriResult = 0;
                }
            } else {
                // 2月節入りデータが見つからない場合は従来の方法を使用
                setsuiriResult = this.isSetsuiri(2);
            }
            
            
            let sixty_kanshi_idx = ((year - 3) % 60 - 1 + setsuiriResult) % 60;
            
            // 負の値になった場合は正の値に変換
            if (sixty_kanshi_idx < 0) {
                sixty_kanshi_idx += 60;
            }
            
            const [y_kan, y_shi] = kanshiData.sixty_kanshi[sixty_kanshi_idx];
            
            return [y_kan, y_shi];
        } catch (e) {
            throw new Error('年干支の計算で例外が送出されました。');
        }
    }

    findMonthKanshi(y_kan) {
        // 生年月日の月を取得
        const birthMonth = this.birthdate.getMonth() + 1;
        const birthDay = this.birthdate.getDate();
        
        // 節入り判定：生年月日が節入り前か後かを判定
        let actualMonth = birthMonth;
        let actualYearKan = y_kan; // 使用する年干（デフォルトは渡された年干）
        
        // 節入りデータから該当する月の節入り日時を検索
        let setsuiriFound = false;
        
        for (const s of kanshiData.setsuiri) {
            if (s[0] === this.birthdate.getFullYear() && s[1] === birthMonth) {
                setsuiriFound = true;
                // 節入り日を取得（時刻は使用しない）
                const setsuiriDay = s[2];
                
                // 生年月日が節入り前の場合、前月の干支を使用
                // 節入り当日は、節入り後として扱う
                if (birthDay < setsuiriDay) {
                    actualMonth = birthMonth - 1;
                    // 1月の場合は前年12月として扱う
                    if (actualMonth === 0) {
                        actualMonth = 12;
                        // 1月節入り前の場合は前年の年干を使用する必要がある
                        // 前年の年干を計算
                        const prevYear = this.birthdate.getFullYear() - 1;
                        let prevYearSetsuiriResult = 0; // 前年なので2月節入りは必ず過ぎている
                        let prevYearSixtyKanshiIdx = ((prevYear - 3) % 60 - 1 + prevYearSetsuiriResult) % 60;
                        if (prevYearSixtyKanshiIdx < 0) {
                            prevYearSixtyKanshiIdx += 60;
                        }
                        const [prevYKan, prevYShi] = kanshiData.sixty_kanshi[prevYearSixtyKanshiIdx];
                        actualYearKan = prevYKan;
                        
                    }
                } else {
                    // 節入り当日または節入り後：現在の月を使用
                    actualMonth = birthMonth;
                }
                break;
            }
        }
        
        // 節入りデータが見つからない場合、現在の月として扱う
        if (!setsuiriFound) {
            actualMonth = birthMonth;
        }
        
        
        // 月干支テーブルから該当する月の干支を取得
        const monthIndex = actualMonth - 1;
        
        const monthKanshi = kanshiData.month_kanshi[actualYearKan][monthIndex];
        
        return [monthKanshi[0], monthKanshi[1]];
    }

    findDayKanshi() {
        // 基準日（1926年1月1日）- UTCで統一
        const baseDate = new Date(Date.UTC(1926, 0, 1, 0, 0, 0, 0)); // 月は0始まり
        
        // 生年月日を正確に設定（元のbirthdateをそのまま使用）
        const targetDate = new Date(this.birthdate);
        
        // タイムスタンプで日数差を計算（繰り上げに修正）
        let elapsedDays = Math.ceil((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // 日干支の計算
        const day_idx = ((elapsedDays % 60) + 60) % 60;
        
        // 補正値26を加える（修正版）
        const adjusted_idx = (((day_idx + 26) % 60) + 60) % 60;
        
        if (typeof kanshiData === 'undefined' || !kanshiData || !Array.isArray(kanshiData.sixty_kanshi)) {
            return [-1, -1];
        }
        
        const entry = kanshiData.sixty_kanshi[adjusted_idx];
        if (!entry || entry.length < 2) {
            return [-1, -1];
        }
        const [d_kan, d_shi] = entry;
        
        return [d_kan, d_shi];
    }

    findZokan(shi) {
        // Python版と同じロジック（最小修正: 前月/前年の節入りを正しく参照）
        const birthYear = this.birthdate.getFullYear();
        const birthMonth = this.birthdate.getMonth() + 1;
        const p = this.isSetsuiri(birthMonth);
        let targetYear = birthYear;
        let targetMonth = birthMonth + p; // pは0または-1

        if (targetMonth <= 0) {
            targetYear = birthYear - 1;
            targetMonth = 12;
        }

        let setsuiri = null;
        for (const s of kanshiData.setsuiri) {
            if (s[0] === targetYear && s[1] === targetMonth) {
                setsuiri = new Date(s[0], s[1] - 1, s[2], s[3], s[4]);
                break;
            }
        }
        
        if (!setsuiri) {
            return -1;
        }
        
        // 空配列の場合（子、卯、酉）：1つの区間
        if (!kanshiData.zokan_time[shi] || kanshiData.zokan_time[shi].length === 0) {
            const result = kanshiData.zokan[shi][0];
            return result;
        }
        
        // 2つの区間がある地支（午、亥）
        if (kanshiData.zokan_time[shi].length === 2) {
            const delta_ms = (kanshiData.zokan_time[shi][0] * 24) * 60 * 60 * 1000;
            const setsuiri_delta = new Date(setsuiri.getTime() + delta_ms);
            
            // 日付のみで比較するため、時刻を00:00:00に設定
            const birthdate_only = new Date(Date.UTC(this.birthdate.getFullYear(), this.birthdate.getMonth(), this.birthdate.getDate()));
            const setsuiri_delta_only = new Date(setsuiri_delta.getFullYear(), setsuiri_delta.getMonth(), setsuiri_delta.getDate());
            
            if (setsuiri_delta_only > birthdate_only) {
                const result = kanshiData.zokan[shi][0];
                return result;
            } else {
                const result = kanshiData.zokan[shi][1];
                return result;
            }
        }
        
        // 3つの区間がある地支（丑、寅、辰、巳、未、申、戌）
        if (kanshiData.zokan_time[shi].length === 3) {
            const delta1_ms = (kanshiData.zokan_time[shi][0] * 24) * 60 * 60 * 1000;
            const delta2_ms = (kanshiData.zokan_time[shi][1] * 24) * 60 * 60 * 1000;
            const setsuiri_delta1 = new Date(setsuiri.getTime() + delta1_ms);
            const setsuiri_delta2 = new Date(setsuiri.getTime() + delta2_ms);
            
            // 日付のみで比較するため、時刻を00:00:00に設定
            const birthdate_only = new Date(Date.UTC(this.birthdate.getFullYear(), this.birthdate.getMonth(), this.birthdate.getDate()));
            const setsuiri_delta1_only = new Date(setsuiri_delta1.getFullYear(), setsuiri_delta1.getMonth(), setsuiri_delta1.getDate());
            const setsuiri_delta2_only = new Date(setsuiri_delta2.getFullYear(), setsuiri_delta2.getMonth(), setsuiri_delta2.getDate());
            
            let zokan;
            if (setsuiri_delta1_only > birthdate_only) {
                zokan = kanshiData.zokan[shi][0];
            } else if (setsuiri_delta1_only <= birthdate_only && birthdate_only <= setsuiri_delta2_only) {
                zokan = kanshiData.zokan[shi][1];
            } else {
                zokan = kanshiData.zokan[shi][2];
            }
            
            return zokan;
        }
        
        // その他の場合（念のため）
        const result = kanshiData.zokan[shi][0];
        return result;
    }

    findTsuhen(s_kan, kan_) {
        try {
            if (kan_ === -1) {
                return -1;
            }
            
            const tsuhenIndex = kanshiData.kan_tsuhen[s_kan].indexOf(kan_);
            
            return tsuhenIndex;
        } catch (e) {
            return -1;
        }
    }

    findTwelveFortune(kan, shi_) {
        try {
            if (shi_ === -1) {
                return -1;
            }
            
            const fortuneIndex = kanshiData.twelve_table[kan][shi_];
            
            return fortuneIndex;
        } catch (e) {
            return -1;
        }
    }

    buildMeishiki() {
        try {
            // 天干・地支を得る
            const [y_kan, y_shi] = this.findYearKanshi();
            const [m_kan, m_shi] = this.findMonthKanshi(y_kan);
            const [d_kan, d_shi] = this.findDayKanshi();

            // 天干・地支の配列を作成（日柱、月柱、年柱の順）
            const tenkan = [d_kan, m_kan, y_kan];
            const chishi = [d_shi, m_shi, y_shi];

            // 蔵干を得る
            const d_zkan = this.findZokan(d_shi);
            let m_zkan = this.findZokan(m_shi);
            let y_zkan = this.findZokan(y_shi);
            
            // 月柱蔵干は共通ロジックの結果をそのまま採用（上書きしない）

            const zokan = [d_zkan, m_zkan, y_zkan];

            // 通変星を計算（日干を基準）
            const tsuhen = [
                this.findTsuhen(d_kan, d_kan),  // 日柱
                this.findTsuhen(d_kan, m_kan),  // 月柱
                this.findTsuhen(d_kan, y_kan)   // 年柱
            ];

            // 蔵干通変星を計算（日干を基準）
            const zokan_tsuhen = [
                this.findTsuhen(d_kan, d_zkan),  // 日柱
                this.findTsuhen(d_kan, m_zkan),  // 月柱
                this.findTsuhen(d_kan, y_zkan)   // 年柱
            ];

            // 十二運を計算（日干を基準）
            const junni = [
                this.findTwelveFortune(d_kan, d_shi),  // 日柱
                this.findTwelveFortune(d_kan, m_shi),  // 月柱
                this.findTwelveFortune(d_kan, y_shi)   // 年柱
            ];

            // 命式に情報を追加
            this.meishiki = {
                tenkan: tenkan,
                chishi: chishi,
                zokan: zokan,
                tsuhen: tsuhen,
                zokan_tsuhen: zokan_tsuhen,
                junni: junni,
                nitchu_tenkan: d_kan,
                getchu_chishi: m_shi,
                getchu_zokan: m_zkan,
                _built: true  // 構築完了フラグを追加
            };
            


            return this.meishiki;
        } catch (e) {
            throw e;
        }
    }

    displayMeishiki() {
        try {
            // ①命式のタイトルを表示
            const meishikiTitle = document.getElementById('meishikiTitle');
            if (meishikiTitle) {
                meishikiTitle.style.display = 'block';
            }
            
            // 命式が既に構築されているかチェック
            if (!this.meishiki.tenkan || !this.meishiki.chishi || !this.meishiki.zokan || !this.meishiki._built) {
                this.buildMeishiki();
            }
            
            // 天干・地支の色マップ
            const chishiColorMap = {
                '寅': '#00823B', '卯': '#92D050', '午': '#FF5050', '巳': '#D20000',
                '辰': '#FFC000', '戌': '#FFC000', '丑': '#FFFF00', '未': '#FFFF00',
                '申': '#7030A0', '酉': '#E642C3', '子': '#390EF2', '亥': '#00B0F0'
            };
            const tenkanColorMap = {
                '甲': '#00823B', '乙': '#92D050', '丙': '#FF5050', '丁': '#D20000',
                '戊': '#FFC000', '己': '#FFFF00', '庚': '#7030A0', '辛': '#E642C3',
                '壬': '#390EF2', '癸': '#00B0F0'
            };

            // 見やすい文字色マップ（黒・グレー除外）
            const readableColorMap = {
                '寅': '#FFFFFF', '卯': '#FFFFFF', '午': '#FFFFFF', '巳': '#FFFFFF',
                '辰': '#0000FF', '戌': '#0000FF', '丑': '#0000FF', '未': '#0000FF',
                '申': '#0000FF', '酉': '#0000FF', '子': '#FFFFFF', '亥': '#FFFFFF',
                '甲': '#FFFFFF', '乙': '#FFFFFF', '丙': '#FFFFFF', '丁': '#FFFFFF',
                '戊': '#0000FF', '己': '#0000FF', '庚': '#0000FF', '辛': '#0000FF',
                '壬': '#FFFFFF', '癸': '#FFFFFF'
            };
            // 補色マップ（一時的適用）
            const complementaryColorMap = {
                '寅': '#FF0000', '卯': '#FF0000', '午': '#00FFFF', '巳': '#00FFFF',
                '辰': '#FF00FF', '戌': '#FF00FF', '丑': '#000000', '未': '#000000',
                '申': '#FFFF00', '酉': '#FFFF00', '子': '#FF8000', '亥': '#FF8000',
                '甲': '#FF0000', '乙': '#FF0000', '丙': '#00FFFF', '丁': '#00FFFF',
                '戊': '#FF00FF', '己': '#000000', '庚': '#FFFF00', '辛': '#FFFF00',
                '壬': '#FF8000', '癸': '#FF8000'
            };

            // 天干の文字色マップ
            const tenkanTextColorMap = {
                '甲': '#AFFFEA', '乙': '#E7FEC2', '丙': '#FFC6B9', '丁': '#FFA7A7',
                '戊': '#FBE875', '己': '#FFFFCC', '庚': '#DECDEF', '辛': '#FFF3FF',
                '壬': '#B7E2FF', '癸': '#EFFBFF'
            };

                    // 基本情報の表示
        const basicInfo = document.getElementById('basicInfo');
        basicInfo.innerHTML = `
            <p>生年月日: ${this.birthdate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
            <p>性別: ${this.sex === 1 ? '男性' : this.sex === 2 ? '女性' : '不明'}</p>
        `;

            // 命式表の表示
            const meishikiTable = document.getElementById('meishikiTable');
            
            // 天干行 - 五行に基づいてクラスを適用
            const tenkanRow = document.getElementById('tenkanRow');
            const tenkanGogyoClasses = [
                this.getGogyoClass(kanshiData.gogyo_kan[this.meishiki.tenkan[0]]), // 日柱
                this.getGogyoClass(kanshiData.gogyo_kan[this.meishiki.tenkan[1]]), // 月柱  
                this.getGogyoClass(kanshiData.gogyo_kan[this.meishiki.tenkan[2]])  // 年柱
            ];
            tenkanRow.innerHTML = `<th class="row-header-1">天干</th>
    <td class="${tenkanGogyoClasses[0]}">${formatKanWithGogyo(this.meishiki.tenkan[0])}</td>
    <td class="${tenkanGogyoClasses[1]}">${formatKanWithGogyo(this.meishiki.tenkan[1])}</td>
    <td class="${tenkanGogyoClasses[2]}">${formatKanWithGogyo(this.meishiki.tenkan[2])}</td>`;

            // 地支行 - 五行に基づいてクラスを適用
            const chishiRow = document.getElementById('chishiRow');
            const chishiGogyoClasses = [
                this.getGogyoClass(kanshiData.gogyo_shi[this.meishiki.chishi[0]]), // 日柱
                this.getGogyoClass(kanshiData.gogyo_shi[this.meishiki.chishi[1]]), // 月柱
                this.getGogyoClass(kanshiData.gogyo_shi[this.meishiki.chishi[2]])  // 年柱
            ];
            chishiRow.innerHTML = `<th class="row-header-2">地支</th>
    <td class="${chishiGogyoClasses[0]}">${formatShiWithGogyo(this.meishiki.chishi[0])}</td>
    <td class="${chishiGogyoClasses[1]}">${formatShiWithGogyo(this.meishiki.chishi[1])}</td>
    <td class="${chishiGogyoClasses[2]}">${formatShiWithGogyo(this.meishiki.chishi[2])}</td>`;

            // 干支番号行（地支の下に移動）
            const kanshiNumRow = document.getElementById('kanshiNumRow');
            const kanshiNumbers = [
                getKanshiNumber(this.meishiki.tenkan[0], this.meishiki.chishi[0]),
                getKanshiNumber(this.meishiki.tenkan[1], this.meishiki.chishi[1]),
                getKanshiNumber(this.meishiki.tenkan[2], this.meishiki.chishi[2])
            ];
            kanshiNumRow.innerHTML = `
                <th class="row-header-3">干支番</th>
                <td>${kanshiNumbers[0]}</td>
                <td>${kanshiNumbers[1]}</td>
                <td>${kanshiNumbers[2]}</td>
            `;

            // 蔵干行
            const zokanRow = document.getElementById('zokanRow');
            const zokanValues = [
                this.meishiki.zokan[0] !== -1 ? kanshiData.kan[this.meishiki.zokan[0]] : '',
                this.meishiki.zokan[1] !== -1 ? kanshiData.kan[this.meishiki.zokan[1]] : '',
                this.meishiki.zokan[2] !== -1 ? kanshiData.kan[this.meishiki.zokan[2]] : ''
            ];
            zokanRow.innerHTML = `
                <th class="row-header-4">蔵干</th>
                <td>${zokanValues[0]}</td>
                <td>${zokanValues[1]}</td>
                <td>${zokanValues[2]}</td>
            `;

            // 通変星行
            const tsuhenRow = document.getElementById('tsuhenRow');
            const tsuhenValues = [
                '',
                this.meishiki.tsuhen[1] !== -1 ? kanshiData.tsuhen[this.meishiki.tsuhen[1]] : '',
                this.meishiki.tsuhen[2] !== -1 ? kanshiData.tsuhen[this.meishiki.tsuhen[2]] : ''
            ];
            tsuhenRow.innerHTML = `
                <th class="row-header-5">通変星</th>
                <td>${tsuhenValues[0]}</td>
                <td>${tsuhenValues[1]}</td>
                <td>${tsuhenValues[2]}</td>
            `;

            // 蔵干通変星行
            const zokanTsuhenRow = document.getElementById('zokanTsuhenRow');
            const zokanTsuhenValues = [
                this.meishiki.zokan_tsuhen[0] !== -1 ? kanshiData.tsuhen[this.meishiki.zokan_tsuhen[0]] : '',
                this.meishiki.zokan_tsuhen[1] !== -1 ? kanshiData.tsuhen[this.meishiki.zokan_tsuhen[1]] : '',
                this.meishiki.zokan_tsuhen[2] !== -1 ? kanshiData.tsuhen[this.meishiki.zokan_tsuhen[2]] : ''
            ];
            zokanTsuhenRow.innerHTML = `
                <th class="row-header-6">通変星</th>
                <td>${zokanTsuhenValues[0]}</td>
                <td>${zokanTsuhenValues[1]}</td>
                <td>${zokanTsuhenValues[2]}</td>
            `;

            // 十二運行
            const junniRow = document.getElementById('junniRow');
            const junniValues = [
                this.meishiki.junni[0] !== -1 ? kanshiData.twelve_fortune[this.meishiki.junni[0]] : '',
                this.meishiki.junni[1] !== -1 ? kanshiData.twelve_fortune[this.meishiki.junni[1]] : '',
                this.meishiki.junni[2] !== -1 ? kanshiData.twelve_fortune[this.meishiki.junni[2]] : ''
            ];
            junniRow.innerHTML = `
                <th class="row-header-7">十二運</th>
                <td>${junniValues[0]}</td>
                <td>${junniValues[1]}</td>
                <td>${junniValues[2]}</td>
            `;


            // 日柱天中殺の表示
        
            let tenchusatsuRow = document.getElementById('tenchusatsuRow');
            if (!tenchusatsuRow) {
                tenchusatsuRow = document.createElement('tr');
                tenchusatsuRow.id = 'tenchusatsuRow';
                tenchusatsuRow.innerHTML = `<th class="row-header-8">天中殺</th><td colspan="3"></td>`;
                meishikiTable.appendChild(tenchusatsuRow);
                // 天中殺行を新規作成
            } else {
                tenchusatsuRow.innerHTML = `<th class="row-header-8">天中殺</th><td colspan="3"></td>`;
                // 天中殺行を更新
            }
            const nitchuNum = getKanshiNumber(this.meishiki.tenkan[0], this.meishiki.chishi[0]);
            let tcs1 = '';
            if (nitchuNum) {
                const idx = Math.floor((nitchuNum - 1) / 10);
                tcs1 = Meishiki.tenchusatsuList[idx];
                // 日柱干支番号と天中殺の計算
            }
            tenchusatsuRow.children[1].colSpan = 3;
            tenchusatsuRow.children[1].textContent = tcs1 ? tcs1 + '天中殺' : '';
            // 天中殺行の作成完了

            // 命式表示完了

        } catch (e) {
            throw e;
        }
    }

    // 五行インデックスからCSSクラス名を取得
    getGogyoClass(gogyoIndex) {
        const gogyoClasses = ['wood-cell', 'fire-cell', 'earth-cell', 'metal-cell', 'water-cell'];
        return gogyoClasses[gogyoIndex] || '';
    }

}

function calculateMeishiki() {
    // 命式計算開始
    
    const birthYear = document.getElementById('birth_year').value;
    const birthMonth = document.getElementById('birth_month').value;
    const birthDay = document.getElementById('birth_day').value;
    const sex = document.querySelector('input[name="sex"]:checked').value;

    // 入力値の取得

    if (!birthYear || !birthMonth || !birthDay) {
        alert('生年月日を入力してください。');
        return;
    }

    // 日付＋時刻を統合
    // 日付文字列から年・月・日を抽出して、時刻を00:00:00に固定
    const year = parseInt(birthYear);
    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);
    let birthDateTime = new Date(year, month - 1, day, 0, 0, 0, 0); // 月は0始まり、時刻は00:00:00.000
    
    // 日付解析結果

    // Meishikiクラスのインスタンスを作成
    const meishiki = new Meishiki(birthDateTime, null, sex);
    
    // 命式の表示を実行（構築も含む）
    meishiki.displayMeishiki();
    
    // 命式計算完了
}

// 五行の相生相克情報を取得する関数
function getGogyoRelation(kanIndex) {
    const gogyoIndex = kanshiData.gogyo_kan[kanIndex];
    const gogyo = kanshiData.gogyo[gogyoIndex];
    const relation = kanshiData.gogyo_relation[`+${gogyo}`] || kanshiData.gogyo_relation[`-${gogyo}`];
    return relation ? `（${relation}）` : '';
}

// 蔵干セルの表示フォーマット関数
function formatZokanCell(kanIndex) {
    const kan = kanshiData.kan[kanIndex];
    const num = kanIndex;
    const gogyoIndex = kanshiData.gogyo_kan[kanIndex];
    const gogyo = kanshiData.gogyo[gogyoIndex];
    // ±判定（木・火・土・金・水の順で0,1=+、2=+、3=+、4=+、ただし陰干は-）
    // 甲乙(+木), 丙丁(+火), 戊己(+土), 庚辛(+金), 壬癸(+水)
    // 陰干（偶数index）は-、陽干（奇数index）は+
    const sign = (kanIndex % 2 === 0) ? '+' : '-';
    return `${kan}（${num}）／${sign}${gogyo}`;
}

// 干名＋五行表示用関数
function formatKanWithGogyo(kanIndex) {
    if (kanIndex === -1) return '';
    const kan = kanshiData.kan[kanIndex];
    const gogyoIndex = kanshiData.gogyo_kan[kanIndex];
    const gogyo = kanshiData.gogyo[gogyoIndex];
    const sign = (kanIndex % 2 === 0) ? '+' : '-';
    return `${kan}<br>（${sign}${gogyo}）`;
}


// 地支＋五行＋番号表示用関数
function formatShiWithGogyo(shiIndex) {
    if (shiIndex === -1) return '';
    const shi = kanshiData.shi[shiIndex];
    const gogyoIndex = kanshiData.gogyo_shi[shiIndex];
    const gogyo = kanshiData.gogyo[gogyoIndex];
    const sign = (shiIndex % 2 === 0) ? '+' : '-';
    return `${shi}<br>（${sign}${gogyo}）`;
}

// 干支番号（1～60）を取得する関数
function getKanshiNumber(kan, shi) {
    for (let i = 0; i < kanshiData.sixty_kanshi.length; i++) {
        if (kanshiData.sixty_kanshi[i][0] === kan && kanshiData.sixty_kanshi[i][1] === shi) {
            return i + 1;
        }
    }
    return '';
}
