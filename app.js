/**
 * BabyFeed AI — app.js
 * Core logic: onboarding, session tracking, poop logging, milestones, analytics, persistence
 */

// ============================================================
// Storage Manager — wraps localStorage
// ============================================================
class StorageManager {
    static PROFILE_KEY = 'babyfeed_profile';
    static SESSIONS_KEY = 'babyfeed_sessions';
    static ACTIVE_KEY = 'babyfeed_active';
    static POOP_KEY = 'babyfeed_poop';
    static MEDICINES_KEY = 'babyfeed_medicines';
    static MEDICINE_LOGS_KEY = 'babyfeed_medicine_logs';
    static COMPLETED_MILESTONES_KEY = 'babyfeed_completed_milestones';

    static getProfile() {
        const data = localStorage.getItem(this.PROFILE_KEY);
        return data ? JSON.parse(data) : null;
    }

    static saveProfile(profile) {
        localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
    }

    static getSessions() {
        const data = localStorage.getItem(this.SESSIONS_KEY);
        return data ? JSON.parse(data) : [];
    }

    static addSession(session) {
        const sessions = this.getSessions();
        sessions.unshift(session);
        localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    }

    static clearSessions() {
        localStorage.removeItem(this.SESSIONS_KEY);
    }

    static getActiveSession() {
        const data = localStorage.getItem(this.ACTIVE_KEY);
        return data ? JSON.parse(data) : null;
    }

    static saveActiveSession(session) {
        localStorage.setItem(this.ACTIVE_KEY, JSON.stringify(session));
    }

    static clearActiveSession() {
        localStorage.removeItem(this.ACTIVE_KEY);
    }

    // Poop logs
    static getPoopLogs() {
        const data = localStorage.getItem(this.POOP_KEY);
        return data ? JSON.parse(data) : [];
    }

    static addPoopLog(log) {
        const logs = this.getPoopLogs();
        logs.unshift(log);
        localStorage.setItem(this.POOP_KEY, JSON.stringify(logs));
    }

    static clearPoopLogs() {
        localStorage.removeItem(this.POOP_KEY);
    }

    // Medicine list
    static getMedicines() {
        const data = localStorage.getItem(this.MEDICINES_KEY);
        return data ? JSON.parse(data) : [];
    }

    static saveMedicines(list) {
        localStorage.setItem(this.MEDICINES_KEY, JSON.stringify(list));
    }

    // Medicine dose logs
    static getMedicineLogs() {
        const data = localStorage.getItem(this.MEDICINE_LOGS_KEY);
        return data ? JSON.parse(data) : [];
    }

    static addMedicineLog(log) {
        const logs = this.getMedicineLogs();
        logs.unshift(log);
        localStorage.setItem(this.MEDICINE_LOGS_KEY, JSON.stringify(logs));
    }

    static clearMedicineLogs() {
        localStorage.removeItem(this.MEDICINE_LOGS_KEY);
    }

    // Completed milestones
    static getCompletedMilestones() {
        try { return JSON.parse(localStorage.getItem(this.COMPLETED_MILESTONES_KEY)) || {}; }
        catch { return {}; }
    }

    static completeMilestone(id, data) {
        const completed = this.getCompletedMilestones();
        completed[id] = data;
        localStorage.setItem(this.COMPLETED_MILESTONES_KEY, JSON.stringify(completed));
    }

    static uncompleteMilestone(id) {
        const completed = this.getCompletedMilestones();
        delete completed[id];
        localStorage.setItem(this.COMPLETED_MILESTONES_KEY, JSON.stringify(completed));
    }

    static clearAll() {
        localStorage.removeItem(this.PROFILE_KEY);
        localStorage.removeItem(this.SESSIONS_KEY);
        localStorage.removeItem(this.ACTIVE_SESSION_KEY);
        localStorage.removeItem(this.POOP_LOGS_KEY);
        localStorage.removeItem(this.MEDICINES_KEY);
        localStorage.removeItem(this.MEDICINE_LOGS_KEY);
        localStorage.removeItem(this.COMPLETED_MILESTONES_KEY);
    }
}

// ============================================================
// Milestones Engine — developmental milestones by age
// ============================================================
class MilestonesEngine {
    static ALL_MILESTONES = [
        // Week 1
        { id: 'w1_grasp', week: 1, icon: '✊', title: 'Reflexive Grip', desc: 'Baby grips your finger tightly when you place it in their palm.' },
        { id: 'w1_cry', week: 1, icon: '😢', title: 'Communicates by Crying', desc: 'Baby uses crying to signal hunger, discomfort, or tiredness.' },
        { id: 'w1_sleep', week: 1, icon: '😴', title: 'Sleeps 16-17 Hours', desc: 'Newborns sleep most of the day, waking mainly to feed.' },
        // Week 2
        { id: 'w2_focus', week: 2, icon: '👀', title: 'Focuses on Faces', desc: 'Baby can focus on objects 8-12 inches away, especially your face.' },
        { id: 'w2_feed', week: 2, icon: '🍼', title: '8-12 Feeds Per Day', desc: 'Feeding frequently is normal — baby is establishing supply.' },
        // Week 3
        { id: 'w3_head', week: 3, icon: '💪', title: 'Brief Head Lift', desc: 'During tummy time, baby may briefly lift their head.' },
        { id: 'w3_sound', week: 3, icon: '👂', title: 'Responds to Sounds', desc: 'Baby startles or becomes alert at sudden noises.' },
        // Week 4
        { id: 'w4_track', week: 4, icon: '👁️', title: 'Tracks Moving Objects', desc: 'Baby follows a moving toy or face with their eyes.' },
        { id: 'w4_pattern', week: 4, icon: '📋', title: 'Feeding Pattern Forming', desc: 'Feeding intervals may start becoming more predictable.' },
        // Week 5
        { id: 'w5_coo', week: 5, icon: '🗣️', title: 'First Coos', desc: 'Baby may start making soft cooing vowel sounds.' },
        { id: 'w5_smile', week: 5, icon: '😊', title: 'Almost Smiling', desc: 'Social smiling is just around the corner!' },
        // Week 6
        { id: 'w6_smile', week: 6, icon: '😄', title: 'First Social Smile!', desc: 'Baby smiles in response to your voice or face — a huge milestone!' },
        { id: 'w6_growth', week: 6, icon: '📈', title: '6-Week Growth Spurt', desc: 'One of the biggest growth spurts. Baby may feed very frequently.' },
        // Week 7
        { id: 'w7_hands', week: 7, icon: '🤲', title: 'Discovers Hands', desc: 'Baby starts noticing and staring at their own hands.' },
        { id: 'w7_neck', week: 7, icon: '💪', title: 'Stronger Neck', desc: 'Better head control during tummy time.' },
        // Week 8
        { id: 'w8_follow', week: 8, icon: '👀', title: 'Follows 180°', desc: 'Baby can track objects in a full arc across their vision.' },
        { id: 'w8_vocal', week: 8, icon: '🎵', title: 'More Vocalizing', desc: 'Cooing becomes more frequent and varied.' },
        // Week 9
        { id: 'w9_reach', week: 9, icon: '🖐️', title: 'Reaching for Toys', desc: 'Baby starts swiping at dangling objects.' },
        { id: 'w9_laugh', week: 9, icon: '😆', title: 'First Giggles', desc: 'Baby may start laughing — the sweetest sound!' },
        // Week 10
        { id: 'w10_roll', week: 10, icon: '🔄', title: 'Trying to Roll', desc: 'Baby may start rocking side to side during tummy time.' },
        { id: 'w10_routine', week: 10, icon: '📅', title: 'Routine Developing', desc: 'Eat-play-sleep cycles become more predictable.' },
        // Week 11
        { id: 'w11_grasp2', week: 11, icon: '🧸', title: 'Holds a Toy', desc: 'Baby can hold a rattle or soft toy briefly.' },
        { id: 'w11_recog', week: 11, icon: '👨‍👩‍👧', title: 'Recognizes Family', desc: 'Baby shows excitement when seeing familiar faces.' },
        // Week 12
        { id: 'w12_headup', week: 12, icon: '🏋️', title: 'Steady Head Control', desc: 'Head stays mostly upright when held in sitting position.' },
        { id: 'w12_growth', week: 12, icon: '📈', title: '3-Month Growth Spurt', desc: 'Another growth spurt — increased hunger is normal.' },
        // Month 4 (week 13-16)
        { id: 'm4_roll', week: 14, icon: '🔄', title: 'Rolling Over', desc: 'Baby may roll from tummy to back.' },
        { id: 'm4_grab', week: 15, icon: '🤲', title: 'Purposeful Grasping', desc: 'Baby reaches for and grabs objects intentionally.' },
        // Month 5 (week 17-20)
        { id: 'm5_sit', week: 18, icon: '🪑', title: 'Sitting with Support', desc: 'Baby can sit up when propped or held.' },
        { id: 'm5_food', week: 20, icon: '🥄', title: 'Interest in Food', desc: 'Baby watches you eat and may reach for your plate.' },
        // Month 6 (week 21-26)
        { id: 'm6_solids', week: 22, icon: '🥕', title: 'Ready for Solids!', desc: 'Baby can sit with support and shows readiness for complementary foods.' },
        { id: 'm6_teeth', week: 24, icon: '🦷', title: 'First Tooth', desc: 'Teething may begin — drooling and chewing increase.' },
    ];

    static getUpcomingMilestones(babyAgeDays) {
        const safeDays = Math.max(0, babyAgeDays);
        const currentWeek = Math.floor(safeDays / 7) + 1;
        const completed = StorageManager.getCompletedMilestones();
        // Show milestones from current week through the next 4 weeks
        return this.ALL_MILESTONES.filter(m => {
            return m.week >= currentWeek - 1 && m.week <= currentWeek + 4 && !completed[m.id];
        });
    }

    static getMilestonesByWeek(milestones) {
        const groups = {};
        milestones.forEach(m => {
            if (!groups[m.week]) groups[m.week] = [];
            groups[m.week].push(m);
        });
        return groups;
    }
}

// ============================================================
// AI Insights Engine — heuristic-based analysis
// ============================================================
class InsightsEngine {
    static analyze(sessions, poopLogs, profile) {
        const insights = [];
        if (!sessions || sessions.length === 0) return insights;

        const now = Date.now();
        const babyAgeDays = profile.dob
            ? Math.floor((now - new Date(profile.dob).getTime()) / (1000 * 60 * 60 * 24))
            : null;
        const babyAgeWeeks = babyAgeDays !== null ? Math.floor(babyAgeDays / 7) : null;
        const babyAgeMonths = babyAgeDays !== null ? Math.floor(babyAgeDays / 30.44) : null;

        // ---- Compute feeding metrics ----
        const durations = sessions.map(s => s.durationMs);
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

        const intervals = [];
        for (let i = 0; i < sessions.length - 1; i++) {
            const gap = new Date(sessions[i].startTime).getTime() - new Date(sessions[i + 1].startTime).getTime();
            if (gap > 0) intervals.push(gap);
        }
        const avgInterval = intervals.length > 0
            ? intervals.reduce((a, b) => a + b, 0) / intervals.length
            : null;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todaySessions = sessions.filter(s => new Date(s.startTime) >= todayStart);

        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
        const thisWeek = sessions.filter(s => new Date(s.startTime).getTime() >= weekAgo);
        const lastWeek = sessions.filter(s => {
            const t = new Date(s.startTime).getTime();
            return t >= twoWeeksAgo && t < weekAgo;
        });

        // Time-of-day
        const hourBuckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        sessions.forEach(s => {
            const h = new Date(s.startTime).getHours();
            if (h >= 5 && h < 12) hourBuckets.morning++;
            else if (h >= 12 && h < 17) hourBuckets.afternoon++;
            else if (h >= 17 && h < 21) hourBuckets.evening++;
            else hourBuckets.night++;
        });

        // Day vs Night ratio
        const dayFeeds = hourBuckets.morning + hourBuckets.afternoon + hourBuckets.evening;
        const nightFeeds = hourBuckets.night;

        const typeCounts = {};
        sessions.forEach(s => {
            typeCounts[s.feedType] = (typeCounts[s.feedType] || 0) + 1;
        });

        // ---- Generate insights ----

        // 1. Feeding frequency
        if (avgInterval !== null) {
            const avgHours = avgInterval / (1000 * 60 * 60);
            if (babyAgeWeeks !== null && babyAgeWeeks <= 4) {
                if (avgHours <= 3) {
                    insights.push({ type: 'positive', icon: '✅', title: 'Great feeding frequency', text: `${profile.babyName} feeds about every ${this.formatHours(avgHours)}. For a newborn, feeding every 2-3 hours is ideal.` });
                } else if (avgHours > 4) {
                    insights.push({ type: 'warning', icon: '⚠️', title: 'Feeding interval may be too long', text: `Average gap is ${this.formatHours(avgHours)}. Newborns typically need feeding every 2-3 hours.` });
                }
            } else {
                insights.push({ type: 'info', icon: '🕐', title: 'Feeding rhythm', text: `${profile.babyName} feeds approximately every ${this.formatHours(avgHours)} on average.` });
            }
        }

        // 2. Duration
        if (sessions.length >= 3) {
            const avgMin = avgDuration / 60000;
            if (avgMin < 5) {
                insights.push({ type: 'warning', icon: '⏱️', title: 'Short feeding sessions', text: `Average feeding lasts ${avgMin.toFixed(0)} minutes. Try encouraging longer feeds if ${profile.babyName} seems unsatisfied.` });
            } else if (avgMin >= 5 && avgMin <= 20) {
                insights.push({ type: 'positive', icon: '👍', title: 'Healthy feed duration', text: `Average session is ${avgMin.toFixed(0)} minutes — right in the typical healthy range.` });
            } else if (avgMin > 30) {
                insights.push({ type: 'info', icon: '💡', title: 'Longer-than-average sessions', text: `Feeds average ${avgMin.toFixed(0)} minutes. Some babies are slower feeders — usually fine.` });
            }
        }

        // 3. Weekly trend
        if (lastWeek.length >= 3 && thisWeek.length >= 1) {
            const thisAvg = thisWeek.length / Math.min(7, (now - weekAgo) / (1000 * 60 * 60 * 24));
            const lastAvg = lastWeek.length / 7;
            const change = ((thisAvg - lastAvg) / lastAvg) * 100;
            if (Math.abs(change) > 15) {
                insights.push({
                    type: change > 0 ? 'info' : 'warning',
                    icon: change > 0 ? '📈' : '📉',
                    title: `Frequency ${change > 0 ? 'up' : 'down'} this week`,
                    text: `${profile.babyName} is feeding ${Math.abs(change).toFixed(0)}% ${change > 0 ? 'more' : 'less'} vs last week.${change > 20 ? ' Could be a growth spurt!' : ''}`
                });
            }
        }

        // 4. Day vs Night ratio
        if (sessions.length >= 6 && nightFeeds > 0) {
            const nightPct = (nightFeeds / sessions.length * 100).toFixed(0);
            if (nightFeeds > dayFeeds) {
                insights.push({ type: 'info', icon: '🌙', title: 'More night feeds', text: `${nightPct}% of feeds happen at night (9pm-5am). This is common in young babies. Nighttime feeds gradually decrease with age.` });
            } else if (babyAgeMonths !== null && babyAgeMonths >= 4 && nightPct > 30) {
                insights.push({ type: 'tip', icon: '🌙', title: 'Night feeding pattern', text: `${nightPct}% of feeds are at night. By ${babyAgeMonths} months, some babies sleep longer stretches. Gradually reducing night feeds can help.` });
            }
        }

        // 5. Feeding time pattern
        const topTime = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0];
        if (sessions.length >= 5 && topTime[1] > sessions.length * 0.35) {
            const timeLabels = { morning: 'morning (5am-12pm)', afternoon: 'afternoon (12-5pm)', evening: 'evening (5-9pm)', night: 'nighttime (9pm-5am)' };
            insights.push({ type: 'info', icon: '☀️', title: 'Peak feeding time', text: `${profile.babyName} feeds most during the ${timeLabels[topTime[0]]}.` });
        }

        // 6. Regularity
        if (intervals.length >= 3) {
            const mean = avgInterval;
            const variance = intervals.reduce((sum, i) => sum + Math.pow(i - mean, 2), 0) / intervals.length;
            const cv = Math.sqrt(variance) / mean;
            if (cv < 0.25) {
                insights.push({ type: 'positive', icon: '🎯', title: 'Very consistent schedule', text: `${profile.babyName}'s feeding times are impressively regular! Consistency helps with sleep and digestion.` });
            } else if (cv < 0.5) {
                insights.push({ type: 'info', icon: '📊', title: 'Moderately consistent', text: `Feeding shows some regularity. Patterns will become more predictable as ${profile.babyName} grows.` });
            } else {
                insights.push({ type: 'tip', icon: '💫', title: 'Variable schedule', text: `Feeding times vary quite a bit — this is common, especially in younger babies. Follow hunger cues.` });
            }
        }

        // 7. Feed type balance
        if (profile.feedType === 'mixed' && sessions.length >= 5) {
            const bottleCount = typeCounts['bottle'] || 0;
            const breastCount = (typeCounts['left-breast'] || 0) + (typeCounts['right-breast'] || 0);
            const total = bottleCount + breastCount;
            if (total > 0) {
                const breastPct = (breastCount / total) * 100;
                insights.push({ type: 'info', icon: '⚖️', title: 'Feeding mix', text: `${breastPct.toFixed(0)}% breast / ${(100 - breastPct).toFixed(0)}% bottle over ${total} feeds.` });
            }
        }

        // 8. Breast side balance
        if ((profile.feedType === 'breast' || profile.feedType === 'mixed') && sessions.length >= 4) {
            const left = typeCounts['left-breast'] || 0;
            const right = typeCounts['right-breast'] || 0;
            if (left + right >= 4) {
                const ratio = left / (left + right);
                if (ratio < 0.3 || ratio > 0.7) {
                    const dominant = ratio > 0.5 ? 'left' : 'right';
                    const other = dominant === 'left' ? 'right' : 'left';
                    insights.push({ type: 'tip', icon: '🔄', title: 'Alternate sides more', text: `${Math.round(Math.max(ratio, 1 - ratio) * 100)}% on ${dominant} side. Try the ${other} more for balance.` });
                }
            }
        }

        // 9. Growth spurt detection
        if (babyAgeDays !== null && sessions.length >= 5) {
            const growthSpurtWindows = [
                { start: 10, end: 18, label: '2-week' },
                { start: 38, end: 48, label: '6-week' },
                { start: 80, end: 95, label: '3-month' },
                { start: 170, end: 190, label: '6-month' },
            ];
            for (const gs of growthSpurtWindows) {
                if (babyAgeDays >= gs.start && babyAgeDays <= gs.end) {
                    // Check if feeding frequency increased recently
                    const recent3Days = sessions.filter(s => (now - new Date(s.startTime).getTime()) < 3 * 24 * 60 * 60 * 1000);
                    const prior3Days = sessions.filter(s => {
                        const t = now - new Date(s.startTime).getTime();
                        return t >= 3 * 24 * 60 * 60 * 1000 && t < 6 * 24 * 60 * 60 * 1000;
                    });
                    if (prior3Days.length > 0 && recent3Days.length > prior3Days.length * 1.3) {
                        insights.push({ type: 'info', icon: '🌱', title: `Possible ${gs.label} growth spurt`, text: `${profile.babyName} is in the typical ${gs.label} growth spurt window and feeding more frequently than before. This usually lasts 2-3 days.` });
                    }
                    break;
                }
            }
        }

        // 10. Longest stretch without feeding
        if (intervals.length >= 3) {
            const maxGap = Math.max(...intervals);
            const maxGapHours = maxGap / (1000 * 60 * 60);
            if (maxGapHours >= 5 && babyAgeWeeks !== null && babyAgeWeeks <= 4) {
                insights.push({ type: 'warning', icon: '⏰', title: 'Long gap detected', text: `Longest gap between feeds was ${this.formatHours(maxGapHours)}. Newborns shouldn't go more than 4 hours without feeding.` });
            } else if (maxGapHours >= 6 && babyAgeMonths !== null && babyAgeMonths >= 3) {
                insights.push({ type: 'positive', icon: '😴', title: 'Longer sleep stretch!', text: `${profile.babyName} went ${this.formatHours(maxGapHours)} between feeds — could indicate longer sleep stretches developing!` });
            }
        }

        // ---- Poop insights ----
        if (poopLogs && poopLogs.length >= 2) {
            const todayPoops = poopLogs.filter(p => new Date(p.time) >= todayStart);
            const recentPoops = poopLogs.slice(0, 20);

            // 11. Poop frequency
            const poopIntervals = [];
            for (let i = 0; i < Math.min(poopLogs.length - 1, 10); i++) {
                const gap = new Date(poopLogs[i].time).getTime() - new Date(poopLogs[i + 1].time).getTime();
                if (gap > 0) poopIntervals.push(gap);
            }
            if (poopIntervals.length >= 2) {
                const avgPoopGap = poopIntervals.reduce((a, b) => a + b, 0) / poopIntervals.length;
                const avgPoopHrs = avgPoopGap / (1000 * 60 * 60);
                if (avgPoopHrs < 6) {
                    insights.push({ type: 'info', icon: '💩', title: 'Active digestion', text: `${profile.babyName} has a bowel movement roughly every ${this.formatHours(avgPoopHrs)}. This is a sign of good milk intake!` });
                } else if (avgPoopHrs > 48 && babyAgeMonths !== null && babyAgeMonths < 2) {
                    insights.push({ type: 'warning', icon: '💩', title: 'Infrequent stools', text: `Average ${this.formatHours(avgPoopHrs)} between stools. For babies under 2 months, less than once daily may warrant a check-up.` });
                }
            }

            // 12. Feed-to-poop correlation
            if (sessions.length >= 3 && poopLogs.length >= 3) {
                let poopsAfterFeed = 0;
                for (const poop of poopLogs.slice(0, 15)) {
                    const poopTime = new Date(poop.time).getTime();
                    for (const feed of sessions) {
                        const feedEnd = new Date(feed.endTime).getTime();
                        const gap = poopTime - feedEnd;
                        if (gap > 0 && gap < 60 * 60 * 1000) { // within 1 hour after feeding
                            poopsAfterFeed++;
                            break;
                        }
                    }
                }
                const correlation = poopsAfterFeed / Math.min(poopLogs.length, 15);
                if (correlation > 0.5) {
                    insights.push({ type: 'info', icon: '🔗', title: 'Feed → poop pattern', text: `${Math.round(correlation * 100)}% of diaper changes happen within an hour of feeding. This gastrocolic reflex is normal and healthy!` });
                }
            }

            // 13. Poop color alert
            const recentColors = recentPoops.map(p => p.color).filter(Boolean);
            if (recentColors.includes('red') || recentColors.includes('black')) {
                const alertColor = recentColors.includes('red') ? 'red' : 'black';
                insights.push({ type: 'warning', icon: '🚨', title: `Unusual stool color`, text: `You logged a ${alertColor} stool. Please consult your pediatrician — ${alertColor} stools can sometimes indicate a medical concern.` });
            }
            if (recentColors.includes('white')) {
                insights.push({ type: 'warning', icon: '🚨', title: 'White/pale stool alert', text: `White or very pale stools should be evaluated by a doctor promptly as they may indicate a liver issue.` });
            }

            // 14. Poop consistency trend
            const consistencies = recentPoops.map(p => p.consistency).filter(Boolean);
            const hardCount = consistencies.filter(c => c === 'hard').length;
            const liquidCount = consistencies.filter(c => c === 'liquid').length;
            if (hardCount > consistencies.length * 0.5 && consistencies.length >= 3) {
                insights.push({ type: 'tip', icon: '💧', title: 'Hard stools noticed', text: `More than half of recent stools are hard. ${babyAgeMonths >= 6 ? 'Try offering more water with meals.' : 'Consult your pediatrician about this.'} ` });
            }
            if (liquidCount > consistencies.length * 0.6 && consistencies.length >= 3 && babyAgeMonths >= 1) {
                insights.push({ type: 'warning', icon: '💧', title: 'Very loose stools', text: `Many recent stools are very liquid. If this persists more than a day or two, consult your pediatrician.` });
            }
        }

        // 15. Age-appropriate tip
        if (babyAgeMonths !== null && sessions.length >= 2) {
            if (babyAgeMonths < 1) {
                insights.push({ type: 'tip', icon: '🌟', title: 'Newborn tip', text: `At ${babyAgeDays} days old, ${profile.babyName} should feed 8-12 times per day. Watch for rooting, sucking on hands, or fussiness.` });
            } else if (babyAgeMonths < 4) {
                insights.push({ type: 'tip', icon: '🌟', title: `${babyAgeMonths}-month tip`, text: `${profile.babyName} may go 2.5-4 hours between feeds now. Growth spurts at 3 weeks, 6 weeks, and 3 months can increase demand.` });
            } else if (babyAgeMonths < 6) {
                insights.push({ type: 'tip', icon: '🌟', title: 'Getting ready for solids', text: `${profile.babyName} is nearing 6 months when solids can begin. Continue milk feeds as primary nutrition.` });
            } else if (babyAgeMonths < 12) {
                insights.push({ type: 'tip', icon: '🌟', title: 'Complementary feeding', text: `At ${babyAgeMonths} months, offer variety of solids alongside milk. Let ${profile.babyName} explore textures and flavors!` });
            }
        }

        return insights.slice(0, 8); // max 8 insights
    }

    static formatHours(hours) {
        if (hours < 1) return `${Math.round(hours * 60)} minutes`;
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return m > 0 ? `${h}h ${m}m` : `${h} hours`;
    }
}

// ============================================================
// Main App
// ============================================================
class BabyFeedApp {
    constructor() {
        // Screens
        this.onboardingScreen = document.getElementById('onboardingScreen');
        this.dashboardScreen = document.getElementById('dashboardScreen');

        // Onboarding
        this.onboardingForm = document.getElementById('onboardingForm');
        this.startBtn = document.getElementById('startBtn');
        this.resetDataBtn = document.getElementById('resetDataBtn');

        // Settings modal
        this.settingsModal = document.getElementById('settingsModal');
        this.settingsForm = document.getElementById('settingsForm');
        this.settingsBabyName = document.getElementById('settingsBabyName');
        this.settingsBabyDob = document.getElementById('settingsBabyDob');
        this.settingsCancelBtn = document.getElementById('settingsCancelBtn');
        this.resetAllDataBtn = document.getElementById('resetAllDataBtn');

        // Dashboard
        this.babyInfoText = document.getElementById('babyInfoText');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.sessionIdle = document.getElementById('sessionIdle');
        this.sessionActive = document.getElementById('sessionActive');
        this.startFeedBtn = document.getElementById('startFeedBtn');
        this.stopFeedBtn = document.getElementById('stopFeedBtn');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.timerLabel = document.getElementById('timerLabel');
        this.quickFeedType = document.getElementById('quickFeedType');

        // Bottle form
        this.bottleForm = document.getElementById('bottleForm');
        this.bottleAmountInput = document.getElementById('bottleAmount');
        this.bottleTimeInput = document.getElementById('bottleTime');
        this.logBottleBtn = document.getElementById('logBottleBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');

        // Past-time start
        this.pastTimeToggle = document.getElementById('pastTimeToggle');
        this.pastTimeRow = document.getElementById('pastTimeRow');
        this.pastTimeMinutes = document.getElementById('pastTimeMinutes');
        this.pastTimeMinus = document.getElementById('pastTimeMinus');
        this.pastTimePlus = document.getElementById('pastTimePlus');
        this.pastTimeActive = false; // whether "started earlier" is toggled on

        // Log Past Session
        this.logPastBtn = document.getElementById('logPastBtn');
        this.pastSessionModal = document.getElementById('pastSessionModal');
        this.pastSessionForm = document.getElementById('pastSessionForm');
        this.pastSessionCancelBtn = document.getElementById('pastSessionCancelBtn');
        this.pastFeedType = 'left-breast';

        // Clock Dial
        this.pastTimeBtn = document.getElementById('pastTimeBtn');
        this.pastTimeBtnLabel = document.getElementById('pastTimeBtnLabel');
        this.clockDialOverlay = document.getElementById('clockDialOverlay');
        this.clockDial = document.getElementById('clockDial');
        this.clockDialHand = document.getElementById('clockDialHand');
        this.clockDialTitle = document.getElementById('clockDialTitle');
        this.clockHourDisplay = document.getElementById('clockHourDisplay');
        this.clockMinDisplay = document.getElementById('clockMinDisplay');
        this.clockConfirmBtn = document.getElementById('clockConfirmBtn');
        this.clockBackBtn = document.getElementById('clockBackBtn');
        this.clockPhase = 'hour'; // 'hour' or 'minute'
        this.clockSelectedHour = 12;
        this.clockSelectedMin = 0;
        this.clockAmPm = 'AM';

        // Poop
        this.logPoopBtn = document.getElementById('logPoopBtn');
        this.poopModal = document.getElementById('poopModal');
        this.poopForm = document.getElementById('poopForm');
        this.poopCancelBtn = document.getElementById('poopCancelBtn');
        this.poopTodayCount = document.getElementById('poopTodayCount');

        // Medicine
        this.addMedBtn = document.getElementById('addMedBtn');
        this.medModal = document.getElementById('medModal');
        this.medForm = document.getElementById('medForm');
        this.medCancelBtn = document.getElementById('medCancelBtn');
        this.medTodayCount = document.getElementById('medTodayCount');
        this.medicineListContainer = document.getElementById('medicineListContainer');
        this.medHistoryContainer = document.getElementById('medHistoryContainer');
        this.medCalendarContainer = document.getElementById('medCalendarContainer');
        this.medFilter = 'all';
        this.medCalendarMonth = new Date(); // current viewing month
        this.medSelectedDate = null; // selected date string (YYYY-MM-DD) or null for today

        // Stats
        this.statTodayCount = document.getElementById('statTodayCount');
        this.statAvgDuration = document.getElementById('statAvgDuration');
        this.statLastFeed = document.getElementById('statLastFeed');
        this.statTotalTime = document.getElementById('statTotalTime');

        // Containers
        this.insightsContainer = document.getElementById('insightsContainer');
        this.milestoneListContainer = document.getElementById('milestoneListContainer');
        this.historyContainer = document.getElementById('historyContainer');

        // Milestone tab
        this.aiInsightsBtn = document.getElementById('aiInsightsBtn');
        this.completedMilestonesBtn = document.getElementById('completedMilestonesBtn');
        this.insightsModal = document.getElementById('insightsModal');
        this.insightsCloseBtn = document.getElementById('insightsCloseBtn');
        this.completedModal = document.getElementById('completedModal');
        this.completedCloseBtn = document.getElementById('completedCloseBtn');
        this.completedListContainer = document.getElementById('completedListContainer');
        this.confettiCanvas = document.getElementById('confettiCanvas');

        // Tabs
        this.tabPanels = {
            home: document.getElementById('tabHome'),
            activity: document.getElementById('tabActivity'),
            insights: document.getElementById('tabInsights'),
            medicine: document.getElementById('tabMedicine')
        };
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.activeTab = 'home';

        // State
        this.profile = null;
        this.currentFeedType = 'left-breast';
        this.sessionStartTime = null;
        this.timerInterval = null;

        // Bind events
        this.onboardingForm.addEventListener('submit', (e) => this.handleOnboarding(e));
        this.startFeedBtn.addEventListener('click', () => this.startSession());
        this.stopFeedBtn.addEventListener('click', () => this.stopSession());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        if (this.resetDataBtn) {
            this.resetDataBtn.addEventListener('click', () => this.handleResetData());
        }
        // Settings modal events
        if (this.settingsForm) {
            this.settingsForm.addEventListener('submit', (e) => this.saveSettings(e));
        }
        if (this.settingsCancelBtn) {
            this.settingsCancelBtn.addEventListener('click', () => this.closeSettings());
        }
        if (this.resetAllDataBtn) {
            this.resetAllDataBtn.addEventListener('click', () => this.handleResetData());
        }
        if (this.logBottleBtn) {
            this.logBottleBtn.addEventListener('click', () => this.logBottleFeed());
        }
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Past-time start events
        if (this.pastTimeToggle) {
            this.pastTimeToggle.addEventListener('click', () => this.togglePastTime());
        }
        if (this.pastTimeMinus) {
            this.pastTimeMinus.addEventListener('click', () => this.adjustPastTime(-5));
        }
        if (this.pastTimePlus) {
            this.pastTimePlus.addEventListener('click', () => this.adjustPastTime(5));
        }

        // Log Past Session events
        if (this.logPastBtn) {
            this.logPastBtn.addEventListener('click', () => this.openPastSessionModal());
        }
        if (this.pastSessionCancelBtn) {
            this.pastSessionCancelBtn.addEventListener('click', () => this.closePastSessionModal());
        }
        if (this.pastSessionForm) {
            this.pastSessionForm.addEventListener('submit', (e) => this.handlePastSession(e));
        }
        // Past feed type chips
        document.querySelectorAll('.past-feed-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.past-feed-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.pastFeedType = chip.dataset.pastFeed;
                const bottleRow = document.getElementById('pastBottleRow');
                if (bottleRow) bottleRow.classList.toggle('hidden', this.pastFeedType !== 'bottle');
            });
        });

        // Clock Dial events
        if (this.pastTimeBtn) {
            this.pastTimeBtn.addEventListener('click', () => this.openClockDial());
        }
        if (this.clockConfirmBtn) {
            this.clockConfirmBtn.addEventListener('click', () => this.clockDialConfirm());
        }
        if (this.clockBackBtn) {
            this.clockBackBtn.addEventListener('click', () => this.clockDialBack());
        }
        if (this.clockHourDisplay) {
            this.clockHourDisplay.addEventListener('click', () => {
                this.clockPhase = 'hour';
                this.renderClockDial();
            });
        }
        if (this.clockMinDisplay) {
            this.clockMinDisplay.addEventListener('click', () => {
                this.clockPhase = 'minute';
                this.renderClockDial();
            });
        }
        document.querySelectorAll('.ampm-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ampm-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.clockAmPm = btn.dataset.ampm;
            });
        });

        // Feed type chips
        this.quickFeedType.querySelectorAll('.feed-chip').forEach(chip => {
            chip.addEventListener('click', () => this.selectFeedType(chip));
        });

        // Poop events
        if (this.logPoopBtn) {
            this.logPoopBtn.addEventListener('click', () => this.openPoopModal());
        }
        if (this.poopCancelBtn) {
            this.poopCancelBtn.addEventListener('click', () => this.closePoopModal());
        }
        if (this.poopForm) {
            this.poopForm.addEventListener('submit', (e) => this.handlePoopLog(e));
        }

        // Tab buttons
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Milestone tab events
        if (this.aiInsightsBtn) {
            this.aiInsightsBtn.addEventListener('click', () => this.openInsightsModal());
        }
        if (this.completedMilestonesBtn) {
            this.completedMilestonesBtn.addEventListener('click', () => this.openCompletedModal());
        }
        if (this.insightsCloseBtn) {
            this.insightsCloseBtn.addEventListener('click', () => {
                if (this.insightsModal) this.insightsModal.classList.add('hidden');
            });
        }
        if (this.completedCloseBtn) {
            this.completedCloseBtn.addEventListener('click', () => {
                if (this.completedModal) this.completedModal.classList.add('hidden');
            });
        }

        // Poop color chips
        document.querySelectorAll('.poop-color-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.poop-color-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });

        // Poop consistency chips
        document.querySelectorAll('.poop-consistency-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.poop-consistency-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });

        // Medicine events
        if (this.addMedBtn) {
            this.addMedBtn.addEventListener('click', () => this.openMedModal());
        }
        if (this.medCancelBtn) {
            this.medCancelBtn.addEventListener('click', () => this.closeMedModal());
        }
        if (this.medForm) {
            this.medForm.addEventListener('submit', (e) => this.handleAddMedicine(e));
        }

        // Medicine "For" selector chips in modal
        document.querySelectorAll('.med-for-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.med-for-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });

        // Medicine filter toggle (Baby / Mom / All)
        document.querySelectorAll('.med-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.med-toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.medFilter = btn.dataset.medFilter;
                this.renderMedicineList();
                this.renderMedicineHistory();
            });
        });

        // ---- Background timer fix ----
        // When app comes back to foreground, restart the timer interval
        // The timer uses Date.now() - startTimestamp, so it auto-corrects
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.sessionStartTime) {
                // Immediately update the display
                this.updateTimer();
                // Restart the interval (it may have been throttled or stopped by the OS)
                if (this.timerInterval) clearInterval(this.timerInterval);
                this.timerInterval = setInterval(() => this.updateTimer(), 1000);
                // Also refresh stats in case time passed
                this.updateStats();
            }
        });

        // Init
        this.init();
    }

    init() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW:', e));
        }

        this.profile = StorageManager.getProfile();
        if (this.profile) {
            this.showDashboard();
            this.resumeActiveSession();
        } else {
            this.showOnboarding();
        }
    }

    // ---- Screens ----
    showOnboarding() {
        this.onboardingScreen.classList.remove('hidden');
        this.dashboardScreen.classList.add('hidden');
    }

    // ---- Tabs ----
    switchTab(tabName) {
        this.activeTab = tabName;
        // Toggle panels
        Object.entries(this.tabPanels).forEach(([key, panel]) => {
            if (panel) panel.classList.toggle('hidden', key !== tabName);
        });
        // Toggle button active states
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        // Refresh data for the active tab
        if (tabName === 'activity') this.updateHistory();
        if (tabName === 'insights') this.updateMilestonesTab();
        if (tabName === 'medicine') {
            this.renderMedicineList();
            this.renderMedicineHistory();
            this.updateMedicineStats();
        }
    }

    showDashboard() {
        this.onboardingScreen.classList.add('hidden');
        this.dashboardScreen.classList.remove('hidden');
        window.scrollTo(0, 0);
        this.updateBabyInfo();
        this.updateStats();
        this.updateHistory();
        this.updateFeedChipsForProfile();
        this.updatePoopStats();
        this.updateMedicineStats();
    }

    // ---- Onboarding ----
    handleOnboarding(e) {
        e.preventDefault();
        const name = document.getElementById('babyName').value.trim();
        const dob = document.getElementById('babyDob').value;
        const feedType = document.querySelector('input[name="feedType"]:checked').value;
        const notes = document.getElementById('babyNotes').value.trim();
        if (!name) return;

        this.profile = { babyName: name, dob: dob || null, feedType, notes, createdAt: new Date().toISOString() };
        StorageManager.saveProfile(this.profile);
        this.showDashboard();
    }

    // ---- Baby Info ----
    updateBabyInfo() {
        if (!this.profile) return;
        const age = this.getAgeString();
        this.babyInfoText.textContent = `${this.profile.babyName}${age ? ' • ' + age : ''}`;
    }

    getAgeString() {
        if (!this.profile.dob) return '';
        const dob = new Date(this.profile.dob);
        const now = new Date();

        if (now < dob) return '';

        let years = now.getFullYear() - dob.getFullYear();
        let months = now.getMonth() - dob.getMonth();
        let days = now.getDate() - dob.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const weeks = Math.floor(days / 7);
        const remainingDays = days % 7;

        let parts = [];
        if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
        if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
        if (weeks > 0) parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
        if (remainingDays > 0) parts.push(`${remainingDays} day${remainingDays > 1 ? 's' : ''}`);

        if (parts.length === 0) return 'Born today! 🎉';

        return parts.join(', ') + ' old';
    }

    updateFeedChipsForProfile() {
        if (!this.profile) return;
        const chips = this.quickFeedType.querySelectorAll('.feed-chip');
        chips.forEach(chip => {
            const type = chip.dataset.type;
            if (this.profile.feedType === 'bottle') {
                chip.classList.toggle('hidden', type !== 'bottle');
                if (type === 'bottle') { chip.classList.add('active'); this.currentFeedType = 'bottle'; }
            } else {
                chip.classList.remove('hidden');
            }
        });
        // Show/hide bottle form based on current feed type
        this.toggleBottleForm();
    }

    selectFeedType(chip) {
        this.quickFeedType.querySelectorAll('.feed-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentFeedType = chip.dataset.type;
        this.toggleBottleForm();
    }

    toggleBottleForm() {
        const isBottle = this.currentFeedType === 'bottle';
        if (this.bottleForm) {
            this.bottleForm.classList.toggle('hidden', !isBottle);
        }
        if (this.startFeedBtn) {
            this.startFeedBtn.classList.toggle('hidden', isBottle);
        }
        // Set bottle time to current time when showing
        if (isBottle && this.bottleTimeInput) {
            const now = new Date();
            this.bottleTimeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        }
    }

    logBottleFeed() {
        const amountStr = this.bottleAmountInput ? this.bottleAmountInput.value : '';
        const amount = parseInt(amountStr, 10);
        if (!amount || amount <= 0) {
            this.bottleAmountInput.focus();
            return;
        }

        // Build the timestamp from the time input
        const timeVal = this.bottleTimeInput ? this.bottleTimeInput.value : '';
        let feedDate = new Date();
        if (timeVal) {
            const [h, m] = timeVal.split(':').map(Number);
            feedDate.setHours(h, m, 0, 0);
        }

        const session = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            startTime: feedDate.toISOString(),
            endTime: feedDate.toISOString(),
            durationMs: 0,
            feedType: 'bottle',
            amountMl: amount
        };

        StorageManager.addSession(session);

        // Reset form
        if (this.bottleAmountInput) this.bottleAmountInput.value = '';
        // Refresh time to current
        const now = new Date();
        if (this.bottleTimeInput) {
            this.bottleTimeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        }

        this.updateStats();
        this.updateInsights();
        this.updateHistory();
    }

    // ---- Past-Time Controls ----
    togglePastTime() {
        this.pastTimeActive = !this.pastTimeActive;
        if (this.pastTimeRow) this.pastTimeRow.classList.toggle('hidden', !this.pastTimeActive);
        if (this.pastTimeToggle) this.pastTimeToggle.classList.toggle('active', this.pastTimeActive);
    }

    adjustPastTime(delta) {
        if (!this.pastTimeMinutes) return;
        let val = parseInt(this.pastTimeMinutes.value, 10) || 10;
        val = Math.max(1, Math.min(180, val + delta));
        this.pastTimeMinutes.value = val;
    }

    // ---- Past Session Modal ----
    openPastSessionModal() {
        if (!this.pastSessionModal) return;
        // Pre-fill with today's date and current time
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const pastDate = document.getElementById('pastDate');
        if (pastDate) pastDate.value = dateStr;

        // Set clock time to current time
        let curHour = now.getHours();
        this.clockAmPm = curHour >= 12 ? 'PM' : 'AM';
        this.clockSelectedHour = curHour % 12 || 12;
        this.clockSelectedMin = now.getMinutes();
        this.updateClockTimeBtn();
        // Store in hidden input
        const pastStartTime = document.getElementById('pastStartTime');
        if (pastStartTime) pastStartTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Reset duration
        const durMin = document.getElementById('pastDurMin');
        const durSec = document.getElementById('pastDurSec');
        if (durMin) durMin.value = '';
        if (durSec) durSec.value = '';
        // Reset feed type
        document.querySelectorAll('.past-feed-chip').forEach(c => c.classList.remove('active'));
        const firstChip = document.querySelector('.past-feed-chip[data-past-feed="left-breast"]');
        if (firstChip) firstChip.classList.add('active');
        this.pastFeedType = 'left-breast';
        const bottleRow = document.getElementById('pastBottleRow');
        if (bottleRow) bottleRow.classList.add('hidden');
        const pastBottleAmt = document.getElementById('pastBottleAmt');
        if (pastBottleAmt) pastBottleAmt.value = '';
        this.pastSessionModal.classList.remove('hidden');
    }

    // ---- Clock Dial ----
    openClockDial() {
        this.clockPhase = 'hour';
        this.renderClockDial();
        if (this.clockDialOverlay) this.clockDialOverlay.classList.remove('hidden');
    }

    closeClockDial() {
        if (this.clockDialOverlay) this.clockDialOverlay.classList.add('hidden');
    }

    renderClockDial() {
        if (!this.clockDial) return;
        const isHour = this.clockPhase === 'hour';

        // Update title
        if (this.clockDialTitle) this.clockDialTitle.textContent = isHour ? 'Select Hour' : 'Select Minute';

        // Update display highlights
        if (this.clockHourDisplay) {
            this.clockHourDisplay.classList.toggle('active', isHour);
            this.clockHourDisplay.textContent = String(this.clockSelectedHour).padStart(2, '0');
        }
        if (this.clockMinDisplay) {
            this.clockMinDisplay.classList.toggle('active', !isHour);
            this.clockMinDisplay.textContent = String(this.clockSelectedMin).padStart(2, '0');
        }

        // Update AM/PM buttons
        document.querySelectorAll('.ampm-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.ampm === this.clockAmPm);
        });

        // Update buttons
        if (this.clockBackBtn) this.clockBackBtn.classList.toggle('hidden', isHour);
        if (this.clockConfirmBtn) this.clockConfirmBtn.textContent = isHour ? 'Next' : 'OK';

        // Clear old numbers
        this.clockDial.querySelectorAll('.clock-num').forEach(n => n.remove());

        // Render numbers
        const ringRadius = 88; // distance from center
        const centerX = 120; // half of 240
        const centerY = 120;

        if (isHour) {
            // 12 hours
            for (let i = 1; i <= 12; i++) {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const x = centerX + ringRadius * Math.cos(angle) - 18;
                const y = centerY + ringRadius * Math.sin(angle) - 18;
                const el = document.createElement('div');
                el.className = 'clock-num' + (i === this.clockSelectedHour ? ' selected' : '');
                el.textContent = i;
                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
                el.addEventListener('click', () => this.selectClockHour(i));
                this.clockDial.appendChild(el);
            }
            // Point hand at selected hour
            const handAngle = this.clockSelectedHour * 30 + 180;
            if (this.clockDialHand) this.clockDialHand.style.transform = `translateX(-50%) rotate(${handAngle}deg)`;
        } else {
            // 12 minute markers: 0, 5, 10, ..., 55
            for (let i = 0; i < 12; i++) {
                const minVal = i * 5;
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const x = centerX + ringRadius * Math.cos(angle) - 18;
                const y = centerY + ringRadius * Math.sin(angle) - 18;
                const el = document.createElement('div');
                el.className = 'clock-num' + (minVal === this.clockSelectedMin ? ' selected' : '');
                el.textContent = String(minVal).padStart(2, '0');
                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
                el.addEventListener('click', () => this.selectClockMinute(minVal));
                this.clockDial.appendChild(el);
            }
            // Point hand at selected minute
            const handAngle = this.clockSelectedMin * 6 + 180;
            if (this.clockDialHand) this.clockDialHand.style.transform = `translateX(-50%) rotate(${handAngle}deg)`;
        }
    }

    selectClockHour(h) {
        this.clockSelectedHour = h;
        this.renderClockDial();
        // Auto-advance to minutes after a short delay
        setTimeout(() => {
            this.clockPhase = 'minute';
            this.renderClockDial();
        }, 300);
    }

    selectClockMinute(m) {
        this.clockSelectedMin = m;
        this.renderClockDial();
    }

    clockDialConfirm() {
        if (this.clockPhase === 'hour') {
            this.clockPhase = 'minute';
            this.renderClockDial();
            return;
        }
        // Phase is minute — confirm and close
        this.updateClockTimeBtn();
        // Set hidden input value in 24h format
        let h24 = this.clockSelectedHour;
        if (this.clockAmPm === 'PM' && h24 !== 12) h24 += 12;
        if (this.clockAmPm === 'AM' && h24 === 12) h24 = 0;
        const pastStartTime = document.getElementById('pastStartTime');
        if (pastStartTime) pastStartTime.value = `${String(h24).padStart(2, '0')}:${String(this.clockSelectedMin).padStart(2, '0')}`;
        this.closeClockDial();
    }

    clockDialBack() {
        if (this.clockPhase === 'minute') {
            this.clockPhase = 'hour';
            this.renderClockDial();
        }
    }

    updateClockTimeBtn() {
        if (this.pastTimeBtnLabel) {
            const hStr = String(this.clockSelectedHour).padStart(2, '0');
            const mStr = String(this.clockSelectedMin).padStart(2, '0');
            this.pastTimeBtnLabel.textContent = `${hStr}:${mStr} ${this.clockAmPm}`;
        }
    }

    closePastSessionModal() {
        if (this.pastSessionModal) this.pastSessionModal.classList.add('hidden');
    }

    handlePastSession(e) {
        e.preventDefault();
        const dateVal = document.getElementById('pastDate')?.value;
        const timeVal = document.getElementById('pastStartTime')?.value;
        if (!dateVal || !timeVal) return;

        const durMinVal = parseInt(document.getElementById('pastDurMin')?.value || '0', 10);
        const durSecVal = parseInt(document.getElementById('pastDurSec')?.value || '0', 10);
        const durationMs = (durMinVal * 60 + durSecVal) * 1000;

        if (durationMs <= 0 && this.pastFeedType !== 'bottle') {
            // Must have some duration for non-bottle feeds
            document.getElementById('pastDurMin')?.focus();
            return;
        }

        // Build start time
        const [h, m] = timeVal.split(':').map(Number);
        const startDate = new Date(dateVal);
        startDate.setHours(h, m, 0, 0);
        const endDate = new Date(startDate.getTime() + durationMs);

        const session = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            durationMs,
            feedType: this.pastFeedType
        };

        // If bottle, add amount
        if (this.pastFeedType === 'bottle') {
            const amt = parseInt(document.getElementById('pastBottleAmt')?.value || '0', 10);
            if (amt > 0) session.amountMl = amt;
        }

        StorageManager.addSession(session);
        this.closePastSessionModal();
        this.updateStats();
        this.updateInsights();
        this.updateHistory();
    }

    // ---- Session Management ----
    startSession() {
        // Calculate start time: if past-time mode is active, subtract minutes
        let startTimestamp = Date.now();
        if (this.pastTimeActive && this.pastTimeMinutes) {
            const minsAgo = parseInt(this.pastTimeMinutes.value, 10) || 0;
            if (minsAgo > 0) {
                startTimestamp = Date.now() - minsAgo * 60 * 1000;
            }
        }

        this.sessionStartTime = startTimestamp;
        StorageManager.saveActiveSession({
            startTime: new Date(this.sessionStartTime).toISOString(),
            feedType: this.currentFeedType
        });

        // Reset past-time UI
        this.pastTimeActive = false;
        if (this.pastTimeRow) this.pastTimeRow.classList.add('hidden');
        if (this.pastTimeToggle) this.pastTimeToggle.classList.remove('active');

        this.sessionIdle.classList.add('hidden');
        this.sessionActive.classList.remove('hidden');
        this.timerLabel.textContent = this.getFeedTypeLabel(this.currentFeedType);
        this.updateTimer(); // show correct elapsed time immediately
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    stopSession() {
        if (!this.sessionStartTime) return;
        const endTime = Date.now();
        const durationMs = endTime - this.sessionStartTime;

        StorageManager.addSession({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            startTime: new Date(this.sessionStartTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            durationMs,
            feedType: this.currentFeedType
        });
        StorageManager.clearActiveSession();

        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.sessionStartTime = null;

        this.sessionIdle.classList.remove('hidden');
        this.sessionActive.classList.add('hidden');
        this.updateStats();
        this.updateInsights();
        this.updateHistory();
    }

    resumeActiveSession() {
        const active = StorageManager.getActiveSession();
        if (!active) return;

        this.sessionStartTime = new Date(active.startTime).getTime();
        this.currentFeedType = active.feedType;

        this.quickFeedType.querySelectorAll('.feed-chip').forEach(c => {
            c.classList.toggle('active', c.dataset.type === this.currentFeedType);
        });

        this.sessionIdle.classList.add('hidden');
        this.sessionActive.classList.remove('hidden');
        this.timerLabel.textContent = this.getFeedTypeLabel(this.currentFeedType);
        this.updateTimer();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    updateTimer() {
        if (!this.sessionStartTime) return;
        const elapsed = Date.now() - this.sessionStartTime;
        this.timerDisplay.textContent = this.formatDuration(elapsed);
    }

    // ---- Poop Logging ----
    openPoopModal() {
        if (this.poopModal) this.poopModal.classList.remove('hidden');
    }

    closePoopModal() {
        if (this.poopModal) this.poopModal.classList.add('hidden');
    }

    handlePoopLog(e) {
        e.preventDefault();
        const activeColor = document.querySelector('.poop-color-chip.active');
        const activeConsistency = document.querySelector('.poop-consistency-chip.active');
        const notes = document.getElementById('poopNotes')?.value.trim() || '';

        const log = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            time: new Date().toISOString(),
            color: activeColor ? activeColor.dataset.color : 'brown',
            consistency: activeConsistency ? activeConsistency.dataset.consistency : 'soft',
            notes
        };

        StorageManager.addPoopLog(log);
        this.closePoopModal();
        this.updatePoopStats();
        this.updateInsights();
        this.updateHistory();

        // Reset form
        if (document.getElementById('poopNotes')) document.getElementById('poopNotes').value = '';
    }

    updatePoopStats() {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayPoops = StorageManager.getPoopLogs().filter(p => new Date(p.time) >= todayStart);
        if (this.poopTodayCount) this.poopTodayCount.textContent = todayPoops.length;
    }

    // ---- Stats ----
    updateStats() {
        const sessions = StorageManager.getSessions();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todaySessions = sessions.filter(s => new Date(s.startTime) >= todayStart);

        this.statTodayCount.textContent = todaySessions.length;

        // Avg duration — only count non-bottle (timed) sessions
        const timedSessions = sessions.filter(s => s.feedType !== 'bottle' || !s.amountMl);
        if (timedSessions.length > 0) {
            const avg = timedSessions.reduce((sum, s) => sum + s.durationMs, 0) / timedSessions.length;
            this.statAvgDuration.textContent = this.formatDurationShort(avg);
        } else {
            this.statAvgDuration.textContent = '—';
        }

        if (sessions.length > 0) {
            const ago = Date.now() - new Date(sessions[0].startTime).getTime();
            this.statLastFeed.textContent = this.formatTimeAgo(ago);
        } else {
            this.statLastFeed.textContent = '—';
        }

        // Total Bottle Milk Today
        if (todaySessions.length > 0) {
            const todayBottle = todaySessions.filter(s => s.amountMl);
            if (todayBottle.length > 0) {
                const totalMl = todayBottle.reduce((sum, s) => sum + s.amountMl, 0);
                this.statTotalTime.textContent = `${totalMl}ml`;
            } else {
                this.statTotalTime.textContent = '0ml';
            }
        } else {
            this.statTotalTime.textContent = '0ml';
        }
    }

    // ---- Insights ----
    updateInsights() {
        const sessions = StorageManager.getSessions();
        const poopLogs = StorageManager.getPoopLogs();
        const insights = InsightsEngine.analyze(sessions, poopLogs, this.profile);

        if (insights.length === 0) {
            this.insightsContainer.innerHTML = '<div class="insight-empty">Log a few feeding sessions to unlock AI-powered insights.</div>';
            return;
        }

        this.insightsContainer.innerHTML = insights.map(i => `
            <div class="insight-card ${i.type}">
                <span class="insight-icon">${i.icon}</span>
                <div class="insight-content">
                    <div class="insight-title">${i.title}</div>
                    <div class="insight-text">${i.text}</div>
                </div>
            </div>
        `).join('');
    }

    // ---- Milestones Tab ----
    updateMilestonesTab() {
        if (!this.profile || !this.profile.dob || !this.milestoneListContainer) return;

        const babyAgeDays = Math.floor((Date.now() - new Date(this.profile.dob).getTime()) / (1000 * 60 * 60 * 24));
        const currentWeek = Math.floor(babyAgeDays / 7) + 1;
        const upcoming = MilestonesEngine.getUpcomingMilestones(babyAgeDays);
        const groups = MilestonesEngine.getMilestonesByWeek(upcoming);
        const completed = StorageManager.getCompletedMilestones();

        if (upcoming.length === 0) {
            this.milestoneListContainer.innerHTML = '<div class="insight-empty">All nearby milestones completed! 🎉 Check back as your baby grows.</div>';
            return;
        }

        let html = '';
        const sortedWeeks = Object.keys(groups).map(Number).sort((a, b) => a - b);

        for (const week of sortedWeeks) {
            const label = week <= currentWeek ? `📍 Week ${week} (Now)` : `🔜 Week ${week}`;
            html += `<div class="milestone-week-group">`;
            html += `<div class="milestone-week-label">${label}</div>`;
            for (const m of groups[week]) {
                const isDone = !!completed[m.id];
                html += `
                    <div class="milestone-item ${isDone ? 'done' : ''}" data-milestone-id="${m.id}">
                        <div class="milestone-check">${isDone ? '✓' : ''}</div>
                        <span class="milestone-item-icon">${m.icon}</span>
                        <div class="milestone-item-body">
                            <div class="milestone-item-title">${m.title}</div>
                            <div class="milestone-item-desc">${m.desc}</div>
                        </div>
                    </div>`;
            }
            html += `</div>`;
        }

        this.milestoneListContainer.innerHTML = html;

        // Attach click listeners
        this.milestoneListContainer.querySelectorAll('.milestone-item').forEach(item => {
            item.addEventListener('click', () => this.toggleMilestone(item.dataset.milestoneId));
        });
    }

    toggleMilestone(id) {
        const completed = StorageManager.getCompletedMilestones();
        if (completed[id]) {
            // Uncomplete — but we keep completed ones in the modal, so just remove
            StorageManager.uncompleteMilestone(id);
        } else {
            // Complete!
            const babyAgeDays = Math.max(0, Math.floor((Date.now() - new Date(this.profile.dob).getTime()) / (1000 * 60 * 60 * 24)));
            StorageManager.completeMilestone(id, {
                completedAt: new Date().toISOString(),
                babyAgeText: this.getAgeString(),
                babyAgeDays
            });
            this.showConfetti();
        }
        this.updateMilestonesTab();
    }

    showConfetti() {
        if (!this.confettiCanvas) return;
        const colors = ['#4caf50', '#fbbf24', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c', '#34d399', '#f87171'];
        const shapes = ['circle', 'rect'];
        for (let i = 0; i < 60; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            const color = colors[Math.floor(Math.random() * colors.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            piece.style.left = `${Math.random() * 100}%`;
            piece.style.backgroundColor = color;
            piece.style.borderRadius = shape === 'circle' ? '50%' : '2px';
            piece.style.width = `${6 + Math.random() * 8}px`;
            piece.style.height = `${6 + Math.random() * 8}px`;
            piece.style.animationDuration = `${2 + Math.random() * 2}s`;
            piece.style.animationDelay = `${Math.random() * 0.5}s`;
            this.confettiCanvas.appendChild(piece);
        }
        // Clean up after animation
        setTimeout(() => {
            this.confettiCanvas.innerHTML = '';
        }, 4500);
    }

    openInsightsModal() {
        const sessions = StorageManager.getSessions();
        const poopLogs = StorageManager.getPoopLogs();
        const insights = InsightsEngine.analyze(sessions, poopLogs, this.profile);

        if (insights.length === 0) {
            this.insightsContainer.innerHTML = '<div class="insight-empty">Log a few feeding sessions to unlock AI-powered insights.</div>';
        } else {
            this.insightsContainer.innerHTML = insights.map(i => `
                <div class="insight-card ${i.type}">
                    <span class="insight-icon">${i.icon}</span>
                    <div class="insight-content">
                        <div class="insight-title">${i.title}</div>
                        <div class="insight-text">${i.text}</div>
                    </div>
                </div>
            `).join('');
        }
        if (this.insightsModal) this.insightsModal.classList.remove('hidden');
    }

    openCompletedModal() {
        const completed = StorageManager.getCompletedMilestones();
        const allMilestones = MilestonesEngine.ALL_MILESTONES;
        const entries = Object.entries(completed);

        if (entries.length === 0) {
            this.completedListContainer.innerHTML = '<div class="insight-empty">No milestones completed yet. Keep going! 💪</div>';
        } else {
            // Sort by completion date (newest first)
            entries.sort((a, b) => new Date(b[1].completedAt) - new Date(a[1].completedAt));
            this.completedListContainer.innerHTML = entries.map(([id, data]) => {
                const milestone = allMilestones.find(m => m.id === id);
                if (!milestone) return '';
                const dateStr = new Date(data.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return `
                    <div class="completed-item">
                        <span class="completed-item-icon">${milestone.icon}</span>
                        <div class="completed-item-body">
                            <div class="completed-item-title">${milestone.title}</div>
                            <div class="completed-item-meta">✅ ${dateStr} · Baby was ${data.babyAgeText}</div>
                        </div>
                    </div>`;
            }).join('');
        }
        if (this.completedModal) this.completedModal.classList.remove('hidden');
    }

    // ---- History (combined feed + poop + medicine) ----
    updateHistory() {
        const sessions = StorageManager.getSessions();
        const poopLogs = StorageManager.getPoopLogs();
        const medLogs = StorageManager.getMedicineLogs();

        if (sessions.length === 0 && poopLogs.length === 0 && medLogs.length === 0) {
            this.historyContainer.innerHTML = '<div class="history-empty">No records yet.</div>';
            this.clearHistoryBtn.classList.add('hidden');
            return;
        }
        this.clearHistoryBtn.classList.remove('hidden');

        // Merge and sort all events
        const events = [];
        sessions.forEach(s => events.push({ type: 'feed', time: s.startTime, data: s }));
        poopLogs.forEach(p => events.push({ type: 'poop', time: p.time, data: p }));
        medLogs.forEach(m => events.push({ type: 'medicine', time: m.time, data: m }));
        events.sort((a, b) => new Date(b.time) - new Date(a.time));

        // Group by date
        const grouped = {};
        events.forEach(ev => {
            const key = new Date(ev.time).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(ev);
        });

        let html = '';
        for (const [dateLabel, dayEvents] of Object.entries(grouped)) {
            html += `<div class="history-date-header">${dateLabel}</div>`;
            dayEvents.forEach(ev => {
                if (ev.type === 'feed') {
                    const s = ev.data;
                    const startTime = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const icon = s.feedType === 'bottle' ? '🍼' : '🤱';

                    if (s.amountMl) {
                        // Bottle feed — show ml and time
                        html += `
                            <div class="history-card">
                                <span class="history-icon">${icon}</span>
                                <div class="history-info">
                                    <div class="history-type">Bottle · ${s.amountMl}ml</div>
                                    <div class="history-time">${startTime}</div>
                                </div>
                                <span class="history-duration">${s.amountMl}ml</span>
                            </div>`;
                    } else {
                        // Timed feed (breast)
                        const endTime = new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        html += `
                            <div class="history-card">
                                <span class="history-icon">${icon}</span>
                                <div class="history-info">
                                    <div class="history-type">${this.getFeedTypeLabel(s.feedType)}</div>
                                    <div class="history-time">${startTime} — ${endTime}</div>
                                </div>
                                <span class="history-duration">${this.formatDurationShort(s.durationMs)}</span>
                            </div>`;
                    }
                } else if (ev.type === 'poop') {
                    const p = ev.data;
                    const time = new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const colorEmojis = { yellow: '🟡', green: '🟢', brown: '🟤', black: '⚫', red: '🔴', white: '⚪' };
                    html += `
                        <div class="history-card poop-card">
                            <span class="history-icon">💩</span>
                            <div class="history-info">
                                <div class="history-type">Diaper Change</div>
                                <div class="history-time">${time}${p.color ? ' • ' + (colorEmojis[p.color] || '') + ' ' + p.color : ''}${p.consistency ? ' • ' + p.consistency : ''}</div>
                            </div>
                            <span class="history-duration poop-badge">💩</span>
                        </div>`;
                } else if (ev.type === 'medicine') {
                    const m = ev.data;
                    const time = new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const forEmoji = m.for === 'baby' ? '👶🏻' : '👩🏻';
                    html += `
                        <div class="history-card med-history-card">
                            <span class="history-icon">💊</span>
                            <div class="history-info">
                                <div class="history-type">${m.medicineName}</div>
                                <div class="history-time">${time} · ${forEmoji} ${m.for === 'baby' ? 'Baby' : 'Mom'}${m.dosage ? ' · ' + m.dosage : ''}</div>
                            </div>
                            <span class="history-duration med-badge">${forEmoji}</span>
                        </div>`;
                }
            });
        }
        this.historyContainer.innerHTML = html;
    }

    clearHistory() {
        if (confirm('Delete all records (feeds, diapers & medicine doses)? This cannot be undone.')) {
            StorageManager.clearSessions();
            StorageManager.clearPoopLogs();
            StorageManager.clearMedicineLogs();
            this.updateStats();
            this.updatePoopStats();
            this.updateMedicineStats();
            this.updateInsights();
            this.updateHistory();
            this.renderMedicineHistory();
        }
    }

    // ---- Settings / Profile ----
    openSettings() {
        if (!this.profile || !this.settingsModal) return;
        this.settingsBabyName.value = this.profile.babyName || '';
        this.settingsBabyDob.value = this.profile.dob || '';
        this.settingsModal.classList.remove('hidden');
    }

    closeSettings() {
        if (this.settingsModal) this.settingsModal.classList.add('hidden');
    }

    saveSettings(e) {
        e.preventDefault();
        const name = this.settingsBabyName.value.trim();
        if (!name) return;
        this.profile.babyName = name;
        this.profile.dob = this.settingsBabyDob.value || null;
        StorageManager.saveProfile(this.profile);
        this.updateBabyInfo();
        this.closeSettings();
    }

    handleOnboarding(e) {
        e.preventDefault();
        const name = document.getElementById('babyName').value.trim();
        const dob = document.getElementById('babyDob').value;
        const feedType = document.querySelector('input[name="feedType"]:checked').value;
        const notes = document.getElementById('babyNotes').value.trim();
        if (!name) return;

        this.profile = { babyName: name, dob: dob || null, feedType, notes, createdAt: new Date().toISOString() };
        StorageManager.saveProfile(this.profile);
        this.showDashboard();
    }

    handleResetData() {
        // Show custom confirmation overlay
        const overlay = document.createElement('div');
        overlay.className = 'reset-confirm-overlay';
        overlay.innerHTML = `
            <div class="reset-confirm-card">
                <div class="reset-icon">⚠️</div>
                <h3>Reset All Data?</h3>
                <p>This will permanently delete <strong>ALL</strong> data including baby profile, feeding logs, diaper logs, medicines, milestones, and insights.<br><br>This action <strong>cannot be undone</strong>.</p>
                <div class="reset-confirm-actions">
                    <button class="btn-cancel-reset">Cancel</button>
                    <button class="btn-confirm-reset">Delete Everything</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('.btn-cancel-reset').addEventListener('click', () => {
            overlay.remove();
        });

        overlay.querySelector('.btn-confirm-reset').addEventListener('click', () => {
            StorageManager.clearAll();
            overlay.remove();
            this.closeSettings();
            this.profile = null;
            this.showOnboarding();
        });
    }

    // ---- Medicine Tracker ----
    openMedModal() {
        if (this.medModal) this.medModal.classList.remove('hidden');
    }

    closeMedModal() {
        if (this.medModal) this.medModal.classList.add('hidden');
    }

    handleAddMedicine(e) {
        e.preventDefault();
        const name = document.getElementById('medName').value.trim();
        if (!name) return;

        const activeFor = document.querySelector('.med-for-chip.active');
        const dosage = document.getElementById('medDosage').value.trim();
        const notes = document.getElementById('medNotes').value.trim();

        const med = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            name,
            for: activeFor ? activeFor.dataset.for : 'baby',
            dosage: dosage || '',
            notes: notes || '',
            active: true,
            createdAt: new Date().toISOString()
        };

        const medicines = StorageManager.getMedicines();
        medicines.push(med);
        StorageManager.saveMedicines(medicines);

        this.closeMedModal();
        this.renderMedicineList();

        // Reset form
        document.getElementById('medName').value = '';
        document.getElementById('medDosage').value = '';
        document.getElementById('medNotes').value = '';
    }

    removeMedicine(id) {
        this.closeMedMenu();
        const medicines = StorageManager.getMedicines();
        const med = medicines.find(m => m.id === id);
        if (!med) return;
        StorageManager.saveMedicines(medicines.filter(m => m.id !== id));
        this.renderMedicineList();
    }

    toggleMedicine(id) {
        this.closeMedMenu();
        const medicines = StorageManager.getMedicines();
        const med = medicines.find(m => m.id === id);
        if (!med) return;
        med.active = !med.active;
        StorageManager.saveMedicines(medicines);
        this.renderMedicineList();
    }

    takeMedicine(id) {
        const medicines = StorageManager.getMedicines();
        const med = medicines.find(m => m.id === id);
        if (!med) return;
        if (!med.active) {
            alert(med.name + ' is currently paused. Resume it first to log a dose.');
            return;
        }

        const log = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            medicineId: med.id,
            medicineName: med.name,
            for: med.for,
            dosage: med.dosage,
            time: new Date().toISOString()
        };

        StorageManager.addMedicineLog(log);
        this.updateMedicineStats();
        this.renderMedicineList();
        this.renderMedicineHistory();
    }

    updateMedicineStats() {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayDoses = StorageManager.getMedicineLogs().filter(l => new Date(l.time) >= todayStart);
        if (this.medTodayCount) this.medTodayCount.textContent = todayDoses.length;
    }

    renderMedicineList() {
        let medicines = StorageManager.getMedicines();
        if (this.medFilter !== 'all') {
            medicines = medicines.filter(m => m.for === this.medFilter);
        }
        // Active medicines first, paused at the bottom
        medicines.sort((a, b) => (b.active !== false ? 1 : 0) - (a.active !== false ? 1 : 0));

        if (medicines.length === 0) {
            this.medicineListContainer.innerHTML = '<div class="med-empty">No medicines added yet. Tap ＋ Add to get started.</div>';
            return;
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayLogs = StorageManager.getMedicineLogs().filter(l => new Date(l.time) >= todayStart);

        this.medicineListContainer.innerHTML = medicines.map(med => {
            const forEmoji = med.for === 'baby' ? '👶🏻' : '👩🏻';
            const forLabel = med.for === 'baby' ? 'Baby' : 'Mom';
            const todayCount = todayLogs.filter(l => l.medicineId === med.id).length;
            const lastDose = StorageManager.getMedicineLogs().find(l => l.medicineId === med.id);
            const lastTime = lastDose
                ? new Date(lastDose.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Never';
            const isActive = med.active !== false;
            const statusLabel = isActive ? '' : '<span class="med-paused-tag">PAUSED</span>';

            return `
                <div class="med-card ${isActive ? '' : 'med-card-paused'}">
                    <div class="med-card-info">
                        <div class="med-card-name">${forEmoji} ${med.name} ${statusLabel}</div>
                        <div class="med-card-detail">
                            ${med.dosage ? '<span class="med-dosage">' + med.dosage + '</span> · ' : ''}
                            <span class="med-for-tag ${med.for}">${forLabel}</span>
                            · Last: ${lastTime}
                            ${todayCount > 0 ? ' · <span class="med-today-badge">' + todayCount + 'x today</span>' : ''}
                        </div>
                    </div>
                    <div class="med-card-actions">
                        ${isActive ? `<button class="btn-take-med" onclick="window.__app.takeMedicine('${med.id}')" title="Take dose">✅ Take</button>` : `<button class="btn-resume-inline" onclick="window.__app.toggleMedicine('${med.id}')" title="Resume">▶️ Resume</button>`}
                        <button class="btn-med-more" onclick="window.__app.showMedMenu('${med.id}')" title="Options">⋯</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    showMedMenu(id) {
        const medicines = StorageManager.getMedicines();
        const med = medicines.find(m => m.id === id);
        if (!med) return;
        const isActive = med.active !== false;
        const pauseLabel = isActive ? '⏸ Pause Medicine' : '▶️ Resume Medicine';

        // Create full-screen overlay with action sheet
        const overlay = document.createElement('div');
        overlay.className = 'med-action-overlay';
        overlay.innerHTML = `
            <div class="med-action-sheet">
                <div class="med-action-title">${med.name}</div>
                <button class="med-action-btn" data-action="toggle">${pauseLabel}</button>
                <button class="med-action-btn med-action-danger" data-action="delete">🗑 Delete Medicine</button>
                <button class="med-action-btn med-action-cancel" data-action="cancel">Cancel</button>
            </div>
        `;

        // Close on overlay tap
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.closest('[data-action="cancel"]')) {
                this.closeMedMenu();
            }
        });

        // Action handlers
        overlay.querySelector('[data-action="toggle"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMedicine(id);
        });
        overlay.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeMedicine(id);
        });

        document.body.appendChild(overlay);
    }

    closeMedMenu() {
        const overlay = document.querySelector('.med-action-overlay');
        if (overlay) overlay.remove();
    }

    renderMedicineHistory() {
        this.renderMedCalendar();
        this.renderMedDayLogs();
    }

    renderMedCalendar() {
        const now = this.medCalendarMonth;
        const year = now.getFullYear();
        const month = now.getMonth();
        const today = new Date();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthLabel = now.toLocaleDateString([], { month: 'long', year: 'numeric' });

        // Get all logs and count per date
        let logs = StorageManager.getMedicineLogs();
        if (this.medFilter !== 'all') {
            logs = logs.filter(l => l.for === this.medFilter);
        }
        const dateCounts = {};
        logs.forEach(l => {
            const d = new Date(l.time);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            dateCounts[key] = (dateCounts[key] || 0) + 1;
        });

        // Selected date defaults to today
        const selKey = this.medSelectedDate || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        let html = `
            <div class="cal-header">
                <button class="cal-nav" onclick="window.__app.calNav(-1)">&lsaquo;</button>
                <span class="cal-month-label">${monthLabel}</span>
                <button class="cal-nav" onclick="window.__app.calNav(1)">&rsaquo;</button>
            </div>
            <div class="cal-grid">
                <div class="cal-day-name">Su</div><div class="cal-day-name">Mo</div><div class="cal-day-name">Tu</div>
                <div class="cal-day-name">We</div><div class="cal-day-name">Th</div><div class="cal-day-name">Fr</div><div class="cal-day-name">Sa</div>
        `;

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="cal-cell cal-empty"></div>';
        }

        // Day cells
        for (let d = 1; d <= daysInMonth; d++) {
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const count = dateCounts[key] || 0;
            const isToday = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear());
            const isSelected = (key === selKey);
            let cls = 'cal-cell';
            if (isToday) cls += ' cal-today';
            if (isSelected) cls += ' cal-selected';
            if (count > 0) cls += ' cal-has-doses';

            html += `<div class="${cls}" onclick="window.__app.selectMedDate('${key}')">
                <span class="cal-date-num">${d}</span>
                ${count > 0 ? `<span class="cal-dot">${count}</span>` : ''}
            </div>`;
        }

        html += '</div>';
        this.medCalendarContainer.innerHTML = html;
    }

    calNav(dir) {
        this.medCalendarMonth.setMonth(this.medCalendarMonth.getMonth() + dir);
        this.medSelectedDate = null;
        this.renderMedicineHistory();
    }

    selectMedDate(dateKey) {
        this.medSelectedDate = dateKey;
        this.renderMedicineHistory();
    }

    renderMedDayLogs() {
        const today = new Date();
        const selKey = this.medSelectedDate || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        let logs = StorageManager.getMedicineLogs();
        if (this.medFilter !== 'all') {
            logs = logs.filter(l => l.for === this.medFilter);
        }

        // Filter logs for the selected date
        const dayLogs = logs.filter(l => {
            const d = new Date(l.time);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return key === selKey;
        });

        const dateObj = new Date(selKey + 'T00:00:00');
        const dateLabel = dateObj.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

        if (dayLogs.length === 0) {
            this.medHistoryContainer.innerHTML = `<div class="med-day-header">${dateLabel}</div><div class="med-empty">No doses on this date.</div>`;
            return;
        }

        let html = `<div class="med-day-header">${dateLabel} — ${dayLogs.length} dose${dayLogs.length > 1 ? 's' : ''}</div>`;
        dayLogs.forEach(log => {
            const time = new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const forEmoji = log.for === 'baby' ? '👶🏻' : '👩🏻';
            html += `
                <div class="history-card med-history-card">
                    <span class="history-icon">💊</span>
                    <div class="history-info">
                        <div class="history-type">${log.medicineName}</div>
                        <div class="history-time">${time} · ${forEmoji} ${log.for === 'baby' ? 'Baby' : 'Mom'}${log.dosage ? ' · ' + log.dosage : ''}</div>
                    </div>
                    <span class="history-duration med-badge">${forEmoji}</span>
                </div>`;
        });
        this.medHistoryContainer.innerHTML = html;
    }

    resetProfile() {
        if (confirm(`Reset ${this.profile.babyName}'s profile? Records will be kept.`)) {
            localStorage.removeItem(StorageManager.PROFILE_KEY);
            this.profile = null;
            this.showOnboarding();
        }
    }

    // ---- Formatters ----
    getFeedTypeLabel(type) {
        return { 'left-breast': 'Left Breast', 'right-breast': 'Right Breast', 'bottle': 'Bottle' }[type] || type;
    }

    // ---- Memories Gallery ----
    renderMemories() {
        if (!this.memoriesGallery) return;
        const memories = StorageManager.getMemories();

        if (memories.length === 0) {
            this.memoriesGallery.innerHTML = `
                <div class="memories-empty">
                    <span class="memories-empty-icon">📷</span>
                    <p>No memories yet! Capture your baby's special moments.</p>
                </div>`;
            return;
        }

        const allMilestones = MilestonesEngine.ALL_MILESTONES;
        this.memoriesGallery.innerHTML = memories.map(m => {
            const dateStr = m.date ? new Date(m.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            const milestone = m.milestoneId ? allMilestones.find(ms => ms.id === m.milestoneId) : null;
            const tagHtml = milestone ? `<span class="memory-card-tag">${milestone.icon} ${milestone.title}</span>` : '';

            return `
                <div class="memory-card" data-memory-id="${m.id}">
                    <img src="${m.photo}" alt="${m.caption || 'Memory'}" loading="lazy" />
                    <div class="memory-card-overlay">
                        <div class="memory-card-caption">${m.caption || ''}</div>
                        <div class="memory-card-date">${dateStr}</div>
                    </div>
                    ${tagHtml}
                </div>`;
        }).join('');

        // Attach click to open viewer
        this.memoriesGallery.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => this.openPhotoViewer(card.dataset.memoryId));
        });
    }

    openAddMemoryModal() {
        if (!this.addMemoryModal) return;

        // Reset form
        this.pendingPhotoData = null;
        if (this.memoryPhotoPreview) {
            this.memoryPhotoPreview.classList.remove('has-photo');
            this.memoryPhotoPreview.innerHTML = `
                <span class="photo-preview-icon">📷</span>
                <span class="photo-preview-text">Tap to add photo</span>`;
        }
        if (this.memoryCaption) this.memoryCaption.value = '';
        if (this.memoryDate) this.memoryDate.value = new Date().toISOString().split('T')[0];
        if (this.memoryPhotoInput) this.memoryPhotoInput.value = '';

        // Populate milestone dropdown
        if (this.memoryMilestone) {
            const allMilestones = MilestonesEngine.ALL_MILESTONES;
            this.memoryMilestone.innerHTML = '<option value="">— None —</option>' +
                allMilestones.map(m => `<option value="${m.id}">${m.icon} ${m.title}</option>`).join('');
        }

        this.addMemoryModal.classList.remove('hidden');
    }

    closeAddMemoryModal() {
        if (this.addMemoryModal) this.addMemoryModal.classList.add('hidden');
    }

    handlePhotoSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            // Compress image using canvas
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 800;
                let w = img.width, h = img.height;
                if (w > MAX_SIZE || h > MAX_SIZE) {
                    if (w > h) { h = (h / w) * MAX_SIZE; w = MAX_SIZE; }
                    else { w = (w / h) * MAX_SIZE; h = MAX_SIZE; }
                }
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                this.pendingPhotoData = canvas.toDataURL('image/jpeg', 0.7);

                // Show preview
                if (this.memoryPhotoPreview) {
                    this.memoryPhotoPreview.classList.add('has-photo');
                    this.memoryPhotoPreview.innerHTML = `<img src="${this.pendingPhotoData}" alt="Preview" />`;
                }
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    handleAddMemory(e) {
        e.preventDefault();
        if (!this.pendingPhotoData) {
            // Flash the photo picker to indicate it's required
            if (this.memoryPhotoPreview) {
                this.memoryPhotoPreview.style.borderColor = '#ef4444';
                setTimeout(() => { this.memoryPhotoPreview.style.borderColor = ''; }, 1500);
            }
            return;
        }

        const memory = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            photo: this.pendingPhotoData,
            caption: this.memoryCaption ? this.memoryCaption.value.trim() : '',
            date: this.memoryDate ? this.memoryDate.value : new Date().toISOString().split('T')[0],
            milestoneId: this.memoryMilestone ? this.memoryMilestone.value : '',
            createdAt: new Date().toISOString()
        };

        StorageManager.addMemory(memory);
        this.closeAddMemoryModal();
        this.renderMemories();
    }

    openPhotoViewer(id) {
        const memories = StorageManager.getMemories();
        const memory = memories.find(m => m.id === id);
        if (!memory || !this.photoViewerModal) return;

        this.viewingMemoryId = id;
        if (this.photoViewerImg) this.photoViewerImg.src = memory.photo;
        if (this.photoViewerCaption) this.photoViewerCaption.textContent = memory.caption || '';

        // Date + baby age
        const dateStr = memory.date ? new Date(memory.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
        if (this.photoViewerMeta) this.photoViewerMeta.textContent = dateStr;

        // Milestone tag
        const milestone = memory.milestoneId ? MilestonesEngine.ALL_MILESTONES.find(m => m.id === memory.milestoneId) : null;
        if (this.photoViewerTag) {
            this.photoViewerTag.textContent = milestone ? `${milestone.icon} ${milestone.title}` : '';
        }

        this.photoViewerModal.classList.remove('hidden');
    }

    closePhotoViewer() {
        if (this.photoViewerModal) this.photoViewerModal.classList.add('hidden');
        this.viewingMemoryId = null;
    }

    deleteMemory() {
        if (!this.viewingMemoryId) return;
        StorageManager.deleteMemory(this.viewingMemoryId);
        this.closePhotoViewer();
        this.renderMemories();
    }

    formatDuration(ms) {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        if (min >= 60) {
            const hrs = Math.floor(min / 60);
            return `${hrs}:${String(min % 60).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        }
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    formatDurationShort(ms) {
        const totalMin = Math.floor(ms / 60000);
        if (totalMin < 1) return '<1m';
        if (totalMin < 60) return `${totalMin}m`;
        const hrs = Math.floor(totalMin / 60);
        const rem = totalMin % 60;
        return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
    }

    formatTimeAgo(ms) {
        const min = Math.floor(ms / 60000);
        if (min < 1) return 'Just now';
        if (min < 60) return `${min}m ago`;
        const hrs = Math.floor(min / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    }
}

// Boot
document.addEventListener('DOMContentLoaded', () => { window.__app = new BabyFeedApp(); });
