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
    static ACTIVE_KEY = 'babyfeed_active_session';
    static POOP_KEY = 'babyfeed_poop_logs';

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
}

// ============================================================
// Milestones Engine — developmental milestones by age
// ============================================================
class MilestonesEngine {
    static getMilestones(babyAgeDays, babyName) {
        if (babyAgeDays === null || babyAgeDays < 0) return [];
        const weeks = Math.floor(babyAgeDays / 7);
        const months = Math.floor(babyAgeDays / 30.44);
        const milestones = [];

        // Define all milestones with age ranges
        const allMilestones = [
            { minDays: 0, maxDays: 14, icon: '🌟', title: 'First 2 Weeks', text: `${babyName} is adjusting to the world! Expect 8-12 feeds per day. Cluster feeding is completely normal. Weight may drop slightly before regaining.`, category: 'feeding' },
            { minDays: 14, maxDays: 21, icon: '📈', title: '2-Week Growth Spurt', text: `Around 2 weeks, many babies have their first growth spurt. ${babyName} may want to feed more frequently for 2-3 days — this is normal!`, category: 'growth' },
            { minDays: 21, maxDays: 35, icon: '👀', title: '3-4 Week Milestone', text: `${babyName} can now focus on faces! Feeding sessions may get more interactive. Another growth spurt may happen around 3 weeks.`, category: 'development' },
            { minDays: 35, maxDays: 49, icon: '📈', title: '6-Week Growth Spurt', text: `The 6-week growth spurt is one of the biggest! ${babyName} may feed every 1-2 hours for a few days. Stay hydrated and well-fed yourself.`, category: 'growth' },
            { minDays: 49, maxDays: 60, icon: '😊', title: '7-8 Week Milestone', text: `${babyName} may start social smiling! Feeding intervals may begin stretching to 2.5-3 hours during the day.`, category: 'development' },
            { minDays: 60, maxDays: 90, icon: '🌙', title: '2-3 Month Milestone', text: `${babyName}'s stomach is growing — feeds may become less frequent but longer. Some babies start sleeping longer stretches at night.`, category: 'feeding' },
            { minDays: 84, maxDays: 98, icon: '📈', title: '3-Month Growth Spurt', text: `Another growth spurt around 3 months. ${babyName} may seem hungrier. Feed on demand and trust the process!`, category: 'growth' },
            { minDays: 90, maxDays: 120, icon: '🤲', title: '3-4 Month Milestone', text: `${babyName} is starting to grasp objects and may bring hands to mouth more. Still too early for solids — breast milk or formula remains ideal.`, category: 'development' },
            { minDays: 120, maxDays: 150, icon: '🪥', title: '4-5 Month Milestone', text: `${babyName} may show interest in what you're eating! Watch for signs of readiness for solids: good head control, sitting with support, reaching for food.`, category: 'feeding' },
            { minDays: 150, maxDays: 180, icon: '🥄', title: 'Almost Ready for Solids', text: `Around 6 months is when most babies are ready for complementary foods. Continue breast/bottle feeds as the primary nutrition source.`, category: 'feeding' },
            { minDays: 180, maxDays: 210, icon: '🥕', title: '6-Month Milestone!', text: `Big milestone! ${babyName} can likely start solids. Begin with single-ingredient purées. Milk remains the primary food source — solids are for exploration.`, category: 'feeding' },
            { minDays: 210, maxDays: 270, icon: '🦷', title: '7-9 Month Milestone', text: `First teeth may appear! ${babyName} can try soft finger foods. Feeding may become messier and more fun. Offer water in a sippy cup during meals.`, category: 'development' },
            { minDays: 270, maxDays: 365, icon: '🎂', title: 'Approaching First Birthday', text: `${babyName} is eating more solids and milk feeds are gradually decreasing. By 12 months, aim for 3 meals + 2 snacks alongside breast/bottle.`, category: 'feeding' },
            { minDays: 365, maxDays: 730, icon: '🥳', title: 'Toddler Stage!', text: `${babyName} is a toddler! Can now have whole cow's milk (if no allergies). Appetite may vary day to day — this is completely normal.`, category: 'feeding' },
        ];

        // Find the current and next milestone
        for (const m of allMilestones) {
            if (babyAgeDays >= m.minDays && babyAgeDays < m.maxDays) {
                milestones.push({ ...m, status: 'current' });
            } else if (babyAgeDays < m.minDays && milestones.length < 2) {
                const daysUntil = m.minDays - babyAgeDays;
                milestones.push({
                    ...m,
                    status: 'upcoming',
                    text: `Coming in ~${daysUntil < 7 ? daysUntil + ' days' : Math.ceil(daysUntil / 7) + ' weeks'}: ${m.text}`
                });
            }
        }

        return milestones.slice(0, 2);
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
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');

        // Poop
        this.logPoopBtn = document.getElementById('logPoopBtn');
        this.poopModal = document.getElementById('poopModal');
        this.poopForm = document.getElementById('poopForm');
        this.poopCancelBtn = document.getElementById('poopCancelBtn');
        this.poopTodayCount = document.getElementById('poopTodayCount');

        // Stats
        this.statTodayCount = document.getElementById('statTodayCount');
        this.statAvgDuration = document.getElementById('statAvgDuration');
        this.statLastFeed = document.getElementById('statLastFeed');
        this.statTotalTime = document.getElementById('statTotalTime');

        // Containers
        this.insightsContainer = document.getElementById('insightsContainer');
        this.milestonesContainer = document.getElementById('milestonesContainer');
        this.historyContainer = document.getElementById('historyContainer');

        // Tabs
        this.tabPanels = {
            home: document.getElementById('tabHome'),
            activity: document.getElementById('tabActivity'),
            insights: document.getElementById('tabInsights')
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
        this.settingsBtn.addEventListener('click', () => this.resetProfile());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

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
        if (tabName === 'insights') this.updateInsights();
    }

    showDashboard() {
        this.onboardingScreen.classList.add('hidden');
        this.dashboardScreen.classList.remove('hidden');
        this.updateBabyInfo();
        this.updateStats();
        this.updateInsights();
        this.updateMilestones();
        this.updateHistory();
        this.updateFeedChipsForProfile();
        this.updatePoopStats();
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
        const days = Math.floor((new Date() - new Date(this.profile.dob)) / (1000 * 60 * 60 * 24));
        if (days < 0) return '';
        if (days === 0) return 'Born today! 🎉';
        if (days === 1) return '1 day old';
        if (days < 7) return `${days} days old`;
        if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} old`;
        const months = Math.floor(days / 30.44);
        if (months < 24) return `${months} month${months > 1 ? 's' : ''} old`;
        const years = Math.floor(months / 12);
        const rem = months % 12;
        return rem > 0 ? `${years}y ${rem}m old` : `${years} year${years > 1 ? 's' : ''} old`;
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
    }

    selectFeedType(chip) {
        this.quickFeedType.querySelectorAll('.feed-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentFeedType = chip.dataset.type;
    }

    // ---- Session Management ----
    startSession() {
        this.sessionStartTime = Date.now();
        StorageManager.saveActiveSession({
            startTime: new Date(this.sessionStartTime).toISOString(),
            feedType: this.currentFeedType
        });

        this.sessionIdle.classList.add('hidden');
        this.sessionActive.classList.remove('hidden');
        this.timerLabel.textContent = this.getFeedTypeLabel(this.currentFeedType);
        this.timerDisplay.textContent = '00:00';
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

        if (sessions.length > 0) {
            const avg = sessions.reduce((sum, s) => sum + s.durationMs, 0) / sessions.length;
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

        if (todaySessions.length > 0) {
            const total = todaySessions.reduce((sum, s) => sum + s.durationMs, 0);
            this.statTotalTime.textContent = this.formatDurationShort(total);
        } else {
            this.statTotalTime.textContent = '—';
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

    // ---- Milestones ----
    updateMilestones() {
        if (!this.profile || !this.profile.dob || !this.milestonesContainer) return;

        const babyAgeDays = Math.floor((Date.now() - new Date(this.profile.dob).getTime()) / (1000 * 60 * 60 * 24));
        const milestones = MilestonesEngine.getMilestones(babyAgeDays, this.profile.babyName);

        if (milestones.length === 0) {
            this.milestonesContainer.innerHTML = '<div class="insight-empty">Milestones will appear as your baby grows.</div>';
            return;
        }

        this.milestonesContainer.innerHTML = milestones.map(m => `
            <div class="milestone-card ${m.status}">
                <span class="milestone-icon">${m.icon}</span>
                <div class="milestone-content">
                    <div class="milestone-badge">${m.status === 'current' ? '📍 Now' : '🔜 Coming up'}</div>
                    <div class="milestone-title">${m.title}</div>
                    <div class="milestone-text">${m.text}</div>
                </div>
            </div>
        `).join('');
    }

    // ---- History (combined feed + poop) ----
    updateHistory() {
        const sessions = StorageManager.getSessions();
        const poopLogs = StorageManager.getPoopLogs();

        if (sessions.length === 0 && poopLogs.length === 0) {
            this.historyContainer.innerHTML = '<div class="history-empty">No records yet.</div>';
            this.clearHistoryBtn.classList.add('hidden');
            return;
        }
        this.clearHistoryBtn.classList.remove('hidden');

        // Merge and sort all events
        const events = [];
        sessions.forEach(s => events.push({ type: 'feed', time: s.startTime, data: s }));
        poopLogs.forEach(p => events.push({ type: 'poop', time: p.time, data: p }));
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
                    const endTime = new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const icon = s.feedType === 'bottle' ? '🍼' : '🤱';
                    html += `
                        <div class="history-card">
                            <span class="history-icon">${icon}</span>
                            <div class="history-info">
                                <div class="history-type">${this.getFeedTypeLabel(s.feedType)}</div>
                                <div class="history-time">${startTime} — ${endTime}</div>
                            </div>
                            <span class="history-duration">${this.formatDurationShort(s.durationMs)}</span>
                        </div>`;
                } else {
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
                }
            });
        }
        this.historyContainer.innerHTML = html;
    }

    clearHistory() {
        if (confirm('Delete all records (feeds + diapers)? This cannot be undone.')) {
            StorageManager.clearSessions();
            StorageManager.clearPoopLogs();
            this.updateStats();
            this.updatePoopStats();
            this.updateInsights();
            this.updateHistory();
        }
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
document.addEventListener('DOMContentLoaded', () => { new BabyFeedApp(); });
