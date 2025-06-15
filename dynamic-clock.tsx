"use client"

// 状態管理とサイドエフェクトを扱うためのReactフックをインポート
import { useState, useEffect } from "react"
// コンポーネントライブラリから事前に作られたUIコンポーネントをインポート
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
// インターフェースで使用するアイコンをインポート
import { Clock, AlarmClock, Globe, Sun, Moon, Sunrise, Sunset } from "lucide-react"

// サポートする時間帯を定義（TypeScriptの型でコードの安全性を向上）
type TimeTheme = "morning" | "afternoon" | "evening" | "night"

// 世界時計オブジェクトの構造を定義
// これによりTypeScriptが各世界時計に必要なプロパティを理解できる
interface WorldClock {
  city: string // 都市名（例：「東京」）
  timezone: string // 技術的なタイムゾーン識別子（例：「Asia/Tokyo」）
  time: string // フォーマットされた文字列としての現在時刻
}

// アラームオブジェクトの構造を定義
interface Alarm {
  id: string // 各アラームの一意識別子
  time: string // アラームが鳴る時刻（例：「07:30」）
  label: string // アラーム用のカスタムメッセージ
  enabled: boolean // アラームがオンかオフか
}

export default function DynamicClock() {
  // 状態変数 - 時間とともに変化するデータを保存

  // 現在の日付と時刻を保存、毎秒更新される
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  // 表示する視覚テーマを保存（朝、午後、夕方、夜）
  const [theme, setTheme] = useState<TimeTheme>("morning")
  
  // Hydrationのためのマウント状態を管理
  const [mounted, setMounted] = useState(false)

  // ユーザーが作成したすべてのアラームを保存
  const [alarms, setAlarms] = useState<Alarm[]>([])

  // ユーザーが新しいアラームを作成する際の時刻入力を保存
  const [newAlarmTime, setNewAlarmTime] = useState("")

  // ユーザーが新しいアラームを作成する際のラベル入力を保存
  const [newAlarmLabel, setNewAlarmLabel] = useState("")

  // 異なる世界時計の情報を保存
  // 世界中の人気都市4つから開始
  const [worldClocks, setWorldClocks] = useState<WorldClock[]>([
    { city: "ニューヨーク", timezone: "America/New_York", time: "" },
    { city: "ロンドン", timezone: "Europe/London", time: "" },
    { city: "東京", timezone: "Asia/Tokyo", time: "" },
    { city: "シドニー", timezone: "Australia/Sydney", time: "" },
  ])

  // エフェクトフック - 特定の出来事が起こったときにコードを実行
  
  // コンポーネントがマウントされたことを追跡
  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
  }, [])

  // このエフェクトは毎秒現在時刻を更新
  useEffect(() => {
    if (!mounted) return
    
    // setIntervalは関数をX ミリ秒ごとに繰り返し実行
    // 1000ミリ秒 = 1秒
    const timer = setInterval(() => {
      setCurrentTime(new Date()) // 現在の日付/時刻を取得して状態を更新
    }, 1000)

    // クリーンアップ関数：コンポーネントがページから削除されたときにタイマーを停止
    // これによりメモリリークを防ぐ
    return () => clearInterval(timer)
  }, [mounted]) // mountedが変更されたときに実行

  // このエフェクトは現在時刻に基づいて視覚テーマを変更
  useEffect(() => {
    if (!currentTime) return
    
    const hour = currentTime.getHours() // 現在の時間を取得（0-23）
    let newTheme: TimeTheme

    // 時間に基づいてどのテーマを使用するかを決定
    if (hour >= 6 && hour < 12) {
      newTheme = "morning" // 午前6時から午後12時
    } else if (hour >= 12 && hour < 18) {
      newTheme = "afternoon" // 午後12時から午後6時
    } else if (hour >= 18 && hour < 21) {
      newTheme = "evening" // 午後6時から午後9時
    } else {
      newTheme = "night" // 午後9時から午前6時
    }

    setTheme(newTheme) // テーマ状態を更新
  }, [currentTime]) // currentTimeが変更されるたびに実行

  // このエフェクトは毎秒すべての世界時計を更新
  useEffect(() => {
    const updateWorldClocks = () => {
      // 各世界時計をそのタイムゾーンの現在時刻で更新
      setWorldClocks((prev) =>
        prev.map((clock) => ({
          ...clock, // 既存のプロパティをすべて保持
          // このタイムゾーンの現在時刻でtimeプロパティのみを更新
          time: new Date().toLocaleTimeString("en-US", {
            timeZone: clock.timezone,
            hour12: false, // 24時間形式を使用
            hour: "2-digit", // 時間は常に2桁で表示
            minute: "2-digit", // 分は常に2桁で表示
            second: "2-digit", // 秒は常に2桁で表示
          }),
        })),
      )
    }

    updateWorldClocks() // 即座に更新
    const timer = setInterval(updateWorldClocks, 1000) // その後毎秒更新
    return () => clearInterval(timer) // コンポーネントがアンマウントされたときのクリーンアップ
  }, [])

  // このエフェクトはアラームが鳴るべきかどうかをチェック
  useEffect(() => {
    if (!currentTime) return
    
    // 現在時刻をHH:MM形式で取得（例：「07:30」）
    const currentTimeString = currentTime.toTimeString().slice(0, 5)

    // 各アラームをチェックして発動すべきかを確認
    alarms.forEach((alarm) => {
      // アラームが有効で、時刻が現在時刻と一致する場合
      if (alarm.enabled && alarm.time === currentTimeString) {
        // アラームメッセージでブラウザアラートを表示
        alert(`アラーム: ${alarm.label || "起きる時間です！"}`)
      }
    })
  }, [currentTime, alarms]) // 時刻またはアラームが変更されたときに実行

  // ヘルパー関数 - 特定のタスクを実行するのに役立つ

  // この関数は現在のテーマ用のCSSクラスを返す
  // 背景色とトランジションを作成
  const getThemeClasses = () => {
    const baseClasses = "min-h-screen transition-all duration-1000 ease-in-out"

    // 現在のテーマに基づいて色を選択
    switch (theme) {
      case "morning":
        // 暖かい日の出の色（アンバー、オレンジ、イエロー）
        return `${baseClasses} bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-300 text-amber-900`
      case "afternoon":
        // 明るい日中の色（ブルー、スカイ、シアン）
        return `${baseClasses} bg-gradient-to-br from-blue-300 via-sky-200 to-cyan-200 text-blue-900`
      case "evening":
        // 夕日の色（オレンジ、レッド、パープル）
        return `${baseClasses} bg-gradient-to-br from-orange-400 via-red-400 to-purple-500 text-white`
      case "night":
        // 暗い夜の色（インディゴ、パープル、ブルー）
        return `${baseClasses} bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white`
      default:
        return baseClasses
    }
  }

  // この関数は現在のテーマに適したアイコンを返す
  const getThemeIcon = () => {
    switch (theme) {
      case "morning":
        return <Sunrise className="w-8 h-8" /> // 日の出アイコン
      case "afternoon":
        return <Sun className="w-8 h-8" /> // 太陽アイコン
      case "evening":
        return <Sunset className="w-8 h-8" /> // 日の入りアイコン
      case "night":
        return <Moon className="w-8 h-8" /> // 月アイコン
    }
  }

  // イベントハンドラー関数 - ユーザーアクションに応答

  // この関数はユーザーが「アラーム追加」ボタンをクリックしたときに実行
  const addAlarm = () => {
    // ユーザーが時刻を入力した場合のみアラームを追加
    if (newAlarmTime) {
      // 新しいアラームオブジェクトを作成
      const newAlarm: Alarm = {
        id: Date.now().toString(), // 現在のタイムスタンプを一意IDとして使用
        time: newAlarmTime, // 入力フィールドからの時刻
        label: newAlarmLabel, // 入力フィールドからのラベル
        enabled: true, // 新しいアラームは有効状態で開始
      }
      // 既存のアラームリストに新しいアラームを追加
      setAlarms([...alarms, newAlarm])
      // 入力フィールドをクリア
      setNewAlarmTime("")
      setNewAlarmLabel("")
    }
  }

  // この関数はアラームのオン/オフを切り替え
  const toggleAlarm = (id: string) => {
    // 一致するIDのアラームを見つけて有効状態を反転
    setAlarms(
      alarms.map(
        (alarm) =>
          alarm.id === id
            ? { ...alarm, enabled: !alarm.enabled } // 有効状態を反転
            : alarm, // 他のアラームは変更しない
      ),
    )
  }

  // この関数はアラームを完全に削除
  const deleteAlarm = (id: string) => {
    // 一致するIDのアラーム以外をすべて保持
    setAlarms(alarms.filter((alarm) => alarm.id !== id))
  }

  // フォーマット関数 - ユーザー向けにデータを見やすくする

  // 時刻をHH:MM:SS形式でフォーマット（例：「14:30:25」）
  const formatTime = (date: Date | null) => {
    if (!date) return "--:--:--"
    return date.toLocaleTimeString("en-US", {
      hour12: false, // 24時間形式を使用
      hour: "2-digit", // 常に2桁で表示
      minute: "2-digit", // 常に2桁で表示
      second: "2-digit", // 常に2桁で表示
    })
  }

  // 日付を日本語スタイルでフォーマット（例：「2024年1月15日月曜日」）
  const formatDate = (date: Date | null) => {
    if (!date) return "----年--月--日"
    return date.toLocaleDateString("ja-JP", {
      weekday: "long", // 完全な曜日名
      year: "numeric", // 完全な年
      month: "long", // 完全な月名
      day: "numeric", // 日付番号
    })
  }

  // ユーザーインターフェースをレンダー
  // これがユーザーの画面に表示される内容
  
  // コンポーネントがまだマウントされていない場合は何も表示しない
  if (!mounted) {
    return null
  }
  
  return (
    <div className={getThemeClasses()}>
      <div className="container mx-auto p-6 space-y-8">
        {/* メイン時計表示 - 上部の大きな時刻表示 */}
        <Card className="bg-white/20 backdrop-blur-sm border-white/30">
          <CardContent className="p-8 text-center">
            {/* アイコンとテキストでテーマインジケーター */}
            <div className="flex items-center justify-center gap-4 mb-4">
              {getThemeIcon()}
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {/* 現在のテーマの日本語テキストを表示 */}
                {theme === "morning" ? "朝" : theme === "afternoon" ? "午後" : theme === "evening" ? "夕方" : "夜"}
              </Badge>
            </div>
            {/* 大きな時刻表示 */}
            <div className="text-6xl md:text-8xl font-mono font-bold mb-4 tracking-wider">
              {formatTime(currentTime)}
            </div>
            {/* 日付表示 */}
            <div className="text-xl md:text-2xl opacity-80">{formatDate(currentTime)}</div>
          </CardContent>
        </Card>

        {/* タブ付きインターフェース - 世界時計とアラームを切り替え */}
        <Tabs defaultValue="world-clock" className="w-full">
          {/* タブボタン */}
          <TabsList className="grid w-full grid-cols-2 bg-white/20 backdrop-blur-sm">
            <TabsTrigger value="world-clock" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              世界時計
            </TabsTrigger>
            <TabsTrigger value="alarms" className="flex items-center gap-2">
              <AlarmClock className="w-4 h-4" />
              アラーム
            </TabsTrigger>
          </TabsList>

          {/* 世界時計タブ - 異なる都市の時刻を表示 */}
          <TabsContent value="world-clock" className="space-y-4">
            {/* 画面サイズに適応するグリッドレイアウト */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 各世界時計をループして表示 */}
              {worldClocks.map((clock, index) => (
                <Card key={index} className="bg-white/20 backdrop-blur-sm border-white/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{clock.city}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-mono font-bold">{clock.time}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* アラームタブ - アラーム設定を管理 */}
          <TabsContent value="alarms" className="space-y-4">
            {/* 新しいアラームを追加するフォーム */}
            <Card className="bg-white/20 backdrop-blur-sm border-white/30">
              <CardHeader>
                <CardTitle>新しいアラームを追加</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 時刻入力フィールド */}
                  <div>
                    <Label htmlFor="alarm-time">時刻</Label>
                    <Input
                      id="alarm-time"
                      type="time"
                      value={newAlarmTime}
                      onChange={(e) => setNewAlarmTime(e.target.value)}
                      className="bg-white/50"
                    />
                  </div>
                  {/* ラベル入力フィールド */}
                  <div>
                    <Label htmlFor="alarm-label">ラベル（任意）</Label>
                    <Input
                      id="alarm-label"
                      placeholder="起きて！"
                      value={newAlarmLabel}
                      onChange={(e) => setNewAlarmLabel(e.target.value)}
                      className="bg-white/50"
                    />
                  </div>
                  {/* 追加ボタン */}
                  <div className="flex items-end">
                    <Button onClick={addAlarm} className="w-full">
                      アラーム追加
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 既存のアラームのリスト */}
            <div className="space-y-2">
              {/* 各アラームをループして表示 */}
              {alarms.map((alarm) => (
                <Card key={alarm.id} className="bg-white/20 backdrop-blur-sm border-white/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      {/* アラーム情報（時刻とラベル） */}
                      <div className="flex items-center gap-4">
                        <Clock className="w-5 h-5" />
                        <div>
                          <div className="font-mono text-lg font-bold">{alarm.time}</div>
                          {/* ラベルが存在する場合のみ表示 */}
                          {alarm.label && <div className="text-sm opacity-80">{alarm.label}</div>}
                        </div>
                      </div>
                      {/* アラームコントロール（オン/オフ切り替えと削除ボタン） */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant={alarm.enabled ? "default" : "secondary"}
                          size="sm"
                          onClick={() => toggleAlarm(alarm.id)}
                        >
                          {alarm.enabled ? "オン" : "オフ"}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteAlarm(alarm.id)}>
                          削除
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* アラームが存在しない場合のメッセージを表示 */}
              {alarms.length === 0 && (
                <Card className="bg-white/20 backdrop-blur-sm border-white/30">
                  <CardContent className="p-8 text-center opacity-60">
                    <AlarmClock className="w-12 h-12 mx-auto mb-4" />
                    <p>アラームが設定されていません</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
