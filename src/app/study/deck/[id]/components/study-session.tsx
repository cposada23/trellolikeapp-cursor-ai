'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Timer, Play, Pause, Square, Trophy, RotateCcw } from 'lucide-react';

interface StudySessionProps {
  deck: {
    id: number;
    name: string;
    description: string | null;
  };
  cards: Array<{
    id: number;
    front: string;
    back: string;
    deckId: number;
  }>;
}

type SessionStatus = 'setup' | 'active' | 'paused' | 'completed';
type CardSide = 'front' | 'back' | 'flipping';

export function StudySession({ deck, cards }: StudySessionProps) {
  // Session state
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('setup');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [shuffledCards, setShuffledCards] = useState<typeof cards>([]);
  const [cardSide, setCardSide] = useState<CardSide>('front');
  
  // Study state
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [answeredCards, setAnsweredCards] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // UI state
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  // Refs
  const answerInputRef = useRef<HTMLInputElement>(null);

  // Shuffle cards on component mount
  useEffect(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
  }, [cards]);

  // Timer management
  useEffect(() => {
    if (sessionStatus === 'active' && !timerInterval) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } else if (sessionStatus !== 'active' && timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [sessionStatus, timerInterval]);

  // Auto-focus answer input when card changes
  useEffect(() => {
    if (sessionStatus === 'active' && cardSide === 'front' && answerInputRef.current) {
      answerInputRef.current.focus();
    }
  }, [currentCardIndex, sessionStatus, cardSide]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start study session
  const startStudy = () => {
    setSessionStatus('active');
    setElapsedTime(0);
    setCurrentCardIndex(0);
    setScore(0);
    setAnsweredCards(0);
    setUserAnswer('');
    setCardSide('front');
  };

  // Pause/Resume session
  const togglePause = () => {
    setSessionStatus(prev => prev === 'active' ? 'paused' : 'active');
  };

  // Exit session
  const handleExitConfirm = () => {
    setShowExitDialog(false);
    setSessionStatus('setup');
    setCurrentCardIndex(0);
    setScore(0);
    setAnsweredCards(0);
    setUserAnswer('');
    setCardSide('front');
    setElapsedTime(0);
  };

  // Validate answer
  const validateAnswer = () => {
    if (!userAnswer.trim()) return;

    const currentCard = shuffledCards[currentCardIndex];
    const userAnswerNormalized = userAnswer.trim().toLowerCase();
    const correctAnswerNormalized = currentCard.back.trim().toLowerCase();
    const correct = userAnswerNormalized === correctAnswerNormalized;

    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + 1);
    }
    setAnsweredCards(prev => prev + 1);

    // Show card flip animation
    setCardSide('flipping');
    setTimeout(() => {
      setCardSide('back');
      setShowFeedback(true);
    }, 300);

    // Auto-progress to next card after 2.5 seconds
    setTimeout(() => {
      proceedToNextCard();
    }, 2500);
  };

  // Proceed to next card or complete session
  const proceedToNextCard = () => {
    setShowFeedback(false);
    setUserAnswer('');
    
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setCardSide('front');
    } else {
      // Session completed
      setSessionStatus('completed');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showFeedback && sessionStatus === 'active') {
      validateAnswer();
    }
  };

  // Study again
  const studyAgain = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setSessionStatus('setup');
    setCurrentCardIndex(0);
    setScore(0);
    setAnsweredCards(0);
    setUserAnswer('');
    setCardSide('front');
    setElapsedTime(0);
    setShowFeedback(false);
  };

  const currentCard = shuffledCards[currentCardIndex];
  const progress = shuffledCards.length > 0 ? ((currentCardIndex + 1) / shuffledCards.length) * 100 : 0;
  const scorePercentage = answeredCards > 0 ? Math.round((score / answeredCards) * 100) : 0;

  // Setup screen
  if (sessionStatus === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link 
              href="/dashboard" 
              className="text-purple-300 hover:text-purple-200 mb-4 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">
              Study: {deck.name}
            </h1>
            {deck.description && (
              <p className="text-purple-300">{deck.description}</p>
            )}
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="bg-gray-900/40 backdrop-blur border-gray-800/50">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-purple-400" />
                </div>
                <CardTitle className="text-2xl font-semibold text-white">
                  Ready to Study?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-900/30 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-300">{cards.length}</div>
                      <div className="text-sm text-gray-400">Cards to Study</div>
                    </div>
                    <div className="bg-blue-900/30 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-300">Random</div>
                      <div className="text-sm text-gray-400">Card Order</div>
                    </div>
                    <div className="bg-indigo-900/30 rounded-lg p-4">
                      <div className="text-2xl font-bold text-indigo-300">Points</div>
                      <div className="text-sm text-gray-400">For Correct Answers</div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div className="text-center space-y-4">
                  <div className="text-gray-300">
                    <p className="mb-2">📖 Study each card carefully</p>
                    <p className="mb-2">⌨️ Type your answer and press Enter or click Validate</p>
                    <p className="mb-2">⏸️ Use Pause/Resume to take breaks</p>
                    <p>🎯 Aim for the highest score possible!</p>
                  </div>
                  
                  <Button 
                    onClick={startStudy}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-3 flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start Study Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Completed screen
  if (sessionStatus === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gray-900/40 backdrop-blur border-gray-800/50">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-green-400" />
                </div>
                <CardTitle className="text-2xl font-semibold text-white">
                  Study Session Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-green-900/30 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-300">{score}/{cards.length}</div>
                    <div className="text-sm text-gray-400">Final Score</div>
                  </div>
                  <div className="bg-blue-900/30 rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-300">{scorePercentage}%</div>
                    <div className="text-sm text-gray-400">Accuracy</div>
                  </div>
                  <div className="bg-purple-900/30 rounded-lg p-4">
                    <div className="text-3xl font-bold text-purple-300">{formatTime(elapsedTime)}</div>
                    <div className="text-sm text-gray-400">Time Taken</div>
                  </div>
                </div>

                <div className="text-center">
                  {scorePercentage >= 90 && (
                    <p className="text-green-400 font-medium">🎉 Excellent work! You&apos;ve mastered this deck!</p>
                  )}
                  {scorePercentage >= 70 && scorePercentage < 90 && (
                    <p className="text-yellow-400 font-medium">👍 Great job! Keep practicing to improve further!</p>
                  )}
                  {scorePercentage < 70 && (
                    <p className="text-orange-400 font-medium">💪 Good effort! Consider reviewing these cards again!</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={studyAgain}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Study Again
                  </Button>
                  
                  <Link href="/dashboard">
                    <Button variant="outline" className="text-purple-300 hover:text-white border-purple-500 hover:border-purple-400 hover:bg-purple-600/20 bg-transparent w-full">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Active study session
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header with controls */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">
              {deck.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-purple-300">
                <Timer className="w-4 h-4" />
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
              <Button
                onClick={togglePause}
                variant="outline"
                size="sm"
                className="text-purple-300 border-purple-500"
              >
                {sessionStatus === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {sessionStatus === 'active' ? 'Pause' : 'Resume'}
              </Button>
              <Button
                onClick={() => setShowExitDialog(true)}
                variant="outline"
                size="sm"
                className="text-red-300 border-red-500"
              >
                <Square className="w-4 h-4 mr-2" />
                Exit
              </Button>
            </div>
          </div>
          
          {/* Progress indicators */}
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Card {currentCardIndex + 1} of {shuffledCards.length}</span>
            <span>Score: {score}/{answeredCards}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Study card and controls */}
        <div className="max-w-2xl mx-auto">
          {currentCard && (
            <div className="space-y-6">
              {/* Flashcard */}
              <Card 
                className={`bg-gray-900/40 backdrop-blur border-gray-800/50 min-h-[200px] transition-all duration-300 ${
                  cardSide === 'flipping' ? 'scale-95 rotate-y-180' : 'scale-100'
                } ${showFeedback && isCorrect ? 'border-green-500/50' : showFeedback && !isCorrect ? 'border-red-500/50' : ''}`}
              >
                <CardContent className="p-8 flex items-center justify-center text-center min-h-[200px]">
                  <div>
                    {cardSide === 'front' ? (
                      <div>
                        <Badge variant="outline" className="mb-4 text-purple-300 border-purple-500">
                          Question
                        </Badge>
                        <div className="text-xl text-white leading-relaxed">
                          {currentCard.front}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Badge variant="outline" className="mb-4 text-green-300 border-green-500">
                          Answer
                        </Badge>
                        <div className="text-xl text-white leading-relaxed mb-4">
                          {currentCard.back}
                        </div>
                        {showFeedback && (
                          <div className={`text-lg font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Answer input (only show when card front is visible and not paused) */}
              {cardSide === 'front' && sessionStatus === 'active' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="answer" className="text-sm font-medium text-gray-300 mb-2 block">
                      Your Answer:
                    </label>
                    <Input
                      ref={answerInputRef}
                      id="answer"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your answer..."
                      className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                      disabled={showFeedback}
                    />
                  </div>
                  
                  <Button 
                    onClick={validateAnswer}
                    disabled={!userAnswer.trim() || showFeedback}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Validate Answer
                  </Button>
                </div>
              )}

              {/* Paused state */}
              {sessionStatus === 'paused' && (
                <Card className="bg-yellow-900/20 backdrop-blur border-yellow-800/50">
                  <CardContent className="p-6 text-center">
                    <div className="text-yellow-300 mb-2">
                      <Pause className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-semibold">Study Session Paused</p>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Take your time! Click Resume when you&lsquo;re ready to continue.
                    </p>
                    <Button 
                      onClick={togglePause}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Resume Study
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Exit confirmation dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Exit Study Session?</DialogTitle>
            <DialogDescription className="text-gray-400">
              Your current progress will be lost. Are you sure you want to exit?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowExitDialog(false)}
              className="text-gray-300 border-gray-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExitConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Exit Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
