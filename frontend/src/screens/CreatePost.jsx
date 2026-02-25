import React, { useState, useCallback, useRef, memo } from 'react';
import {
  TextInput, StyleSheet, ActivityIndicator, Alert, LayoutAnimation,
  Platform, UIManager, Image, Animated, TouchableOpacity, KeyboardAvoidingView,
  Modal as RNModal,
  View,
} from 'react-native';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { createPost, getAllPosts } from '../api/postService';
import { DatePickerModal } from '@/src/components/DatePicker/DatePickerModal.jsx';
import useCurrentUser from '../utils/GetUser';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { TOPIC_COLORS } from '../utils/TopicColors';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';
import { Switch } from '@/components/ui/switch';
import { ScrollView } from '@/components/ui/scroll-view';

// ─── Floating Label Input ──────────────────────────────────────────────────────

const FloatingInput = memo(({ t, label, value, multiline, minHeight, maxLength, ...props }) => {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const isActive = focused || !!value;

  const animate = (to) =>
    Animated.timing(anim, { toValue: to, duration: 160, useNativeDriver: false }).start();

  const labelTop = anim.interpolate({ inputRange: [0, 1], outputRange: [multiline ? 16 : 14, -9] });
  const labelSize = anim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor = anim.interpolate({ inputRange: [0, 1], outputRange: [t.secondaryText, focused ? t.accent : t.secondaryText] });
  const borderColor = focused ? t.accent : t.placeholder;

  return (
    <Box style={[s.floatWrap, { borderColor, backgroundColor: t.inputBackground }]}>
      <Animated.Text style={[s.floatLabel, { top: labelTop, fontSize: labelSize, color: labelColor, backgroundColor: t.inputBackground }]}>
        {label}
      </Animated.Text>
      <TextInput
        value={value}
        multiline={multiline}
        style={[s.floatInput, { color: t.text, minHeight: minHeight || (multiline ? 120 : undefined), textAlignVertical: multiline ? 'top' : 'center' }]}
        onFocus={() => { setFocused(true); animate(1); }}
        onBlur={() => { setFocused(false); if (!value) animate(0); }}
        maxLength={maxLength}
        selectionColor={t.accent}
        {...props}
      />
      {maxLength && (
        <Text style={[s.charCount, { color: value?.length > maxLength * 0.85 ? t.accent : t.secondaryText }]}>
          {value?.length || 0}/{maxLength}
        </Text>
      )}
    </Box>
  );
});

// ─── Topic Picker ──────────────────────────────────────────────────────────────

const TOPIC_ICONS = {
  'asuminen ja rakentaminen': 'home',
  'kulttuuri ja vapaa-aika': 'color-palette',
  'liikenne ja kadut': 'car',
  'liikunta ja luonto': 'bicycle',
  'kasvatus ja opetus': 'school',
  'työelämä': 'briefcase',
  'kaupunki ja päätöksenteko': 'business',
  'yritykset': 'storefront',
  'matkailu': 'airplane',
  'luonto ja kestävä kehitys': 'leaf',
  'osallistu': 'people',
  'tuoreimmat': 'flash',
};

const TopicPicker = memo(({ t, topic, onSelect }) => {
  const [open, setOpen] = useState(false);
  const topics = Object.keys(TOPIC_COLORS || {});

  return (
    <>
      {(() => {
        const tc = topic ? (TOPIC_COLORS[topic] || { bg: t.inputBackground, text: t.secondaryText }) : null;
        return (
          <Pressable
            style={[s.topicTrigger, {
              backgroundColor: tc ? tc.bg : t.inputBackground,
              borderColor: tc ? tc.text : open ? t.accent : t.placeholder,
              borderWidth: tc ? 2 : 1.5,
            }]}
            onPress={() => setOpen(true)}
          >
            <HStack style={{ alignItems: 'center', gap: 10 }}>
              {tc ? (
                <>
                  <Ionicons name={TOPIC_ICONS[topic] || 'star'} size={15} color={tc.text} />
                  <Text style={{ color: tc.text, fontWeight: '700', fontSize: 15 }}>{topic}</Text>
                </>
              ) : (
                <Text style={{ color: t.secondaryText, fontSize: 15 }}>Choose a topic…</Text>
              )}
            </HStack>
            <View style={[s.topicChevron, { backgroundColor: tc ? tc.text + '22' : t.accent + '18' }]}>
              <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={tc ? tc.text : t.accent} />
            </View>
          </Pressable>
        );
      })()}

      <RNModal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={{ backgroundColor: t.cardBackground, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingBottom: 40 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: t.placeholder, alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ color: t.text, fontWeight: '700', fontSize: 17, paddingHorizontal: 20, marginBottom: 4 }}>Pick a Topic</Text>
            <Text style={{ color: t.secondaryText, fontSize: 13, paddingHorizontal: 20, marginBottom: 16 }}>What's your post about?</Text>
            <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
              {topics.map(name => {
                const tc = TOPIC_COLORS[name] || { bg: '#F3F4F6', text: '#374151' };
                const selected = topic === name;
                return (
                  <Pressable
                    key={name}
                    onPress={() => { onSelect(name); setOpen(false); }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingVertical: 9,
                      paddingHorizontal: 14,
                      borderRadius: 20,
                      borderWidth: selected ? 2 : 1.5,
                      borderColor: tc.text,
                      backgroundColor: tc.bg,
                    }}
                  >
                    <Ionicons name={TOPIC_ICONS[name] || 'star'} size={13} color={tc.text} />
                    <Text style={{ color: tc.text, fontWeight: selected ? '700' : '500', fontSize: 13 }}>{name}</Text>
                    {selected && <Ionicons name="checkmark-circle" size={15} color={tc.text} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </RNModal>
    </>
  );
});


// ─── Image Picker Zone ─────────────────────────────────────────────────────────

const ImageZone = memo(({ t, image, onPick, onRemove }) => {
  if (image) return (
    <Box style={s.imageCard}>
      <Image source={{ uri: image }} style={s.imagePreview} resizeMode="cover" />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={s.imageGradient}>
        <HStack style={{ gap: 10, justifyContent: 'flex-end', padding: 10 }}>
          <Pressable onPress={onPick} style={[s.imageAction, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="swap-horizontal" size={15} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Change</Text>
          </Pressable>
          <Pressable onPress={onRemove} style={[s.imageAction, { backgroundColor: 'rgba(220,38,38,0.75)' }]}>
            <Ionicons name="trash-outline" size={15} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Remove</Text>
          </Pressable>
        </HStack>
      </LinearGradient>
    </Box>
  );

  return (
    <Pressable onPress={onPick} style={[s.uploadZone, { borderColor: t.accent + '55', backgroundColor: t.accent + '08' }]}>
      <Box style={[s.uploadIconRing, { borderColor: t.accent + '40', backgroundColor: t.accent + '14' }]}>
        <Ionicons name="cloud-upload-outline" size={28} color={t.accent} />
      </Box>
      <Text style={{ color: t.text, fontWeight: '600', fontSize: 15, marginTop: 10 }}>Upload an image</Text>
      <Text style={{ color: t.secondaryText, fontSize: 12, marginTop: 3 }}>Tap to browse your library</Text>
    </Pressable>
  );
});

// ─── Date Selector Card ────────────────────────────────────────────────────────

const DateCard = memo(({ t, endTime, onPress }) => {
  const hasDate = !!endTime;
  const day   = hasDate ? endTime.getDate() : null;
  const month = hasDate ? endTime.toLocaleString('default', { month: 'short' }) : null;
  const year  = hasDate ? endTime.getFullYear() : null;

  return (
    <Pressable onPress={onPress} style={[s.dateCard, { backgroundColor: t.inputBackground, borderColor: hasDate ? t.accent : t.placeholder }]}>
      {hasDate ? (
        <HStack style={{ alignItems: 'center', gap: 14 }}>
          <Box style={[s.dateBadge, { backgroundColor: t.accent }]}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{month}</Text>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', lineHeight: 26 }}>{day}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10 }}>{year}</Text>
          </Box>
          <VStack style={{ gap: 2 }}>
            <Text style={{ color: t.secondaryText, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Poll ends on</Text>
            <Text style={{ color: t.text, fontWeight: '700', fontSize: 16 }}>
              {endTime.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </VStack>
        </HStack>
      ) : (
        <HStack style={{ alignItems: 'center', gap: 12 }}>
          <Box style={[s.dateBadge, { backgroundColor: t.placeholder + '55' }]}>
            <Ionicons name="calendar-outline" size={22} color={t.secondaryText} />
          </Box>
          <VStack style={{ gap: 2 }}>
            <Text style={{ color: t.text, fontWeight: '600', fontSize: 15 }}>No end date set</Text>
            <Text style={{ color: t.secondaryText, fontSize: 12 }}>Tap to set a poll deadline</Text>
          </VStack>
        </HStack>
      )}
      <Box style={[s.dateEdit, { backgroundColor: t.accent + '18' }]}>
        <Ionicons name={hasDate ? 'pencil' : 'add'} size={14} color={t.accent} />
      </Box>
    </Pressable>
  );
});

// ─── Question Card ─────────────────────────────────────────────────────────────

const QuestionCard = memo(({ q, qIndex, t, onUpdate, onRemove, onToggleMultiple, onAddOption, onRemoveOption, onUpdateOption }) => {
  const [focusedOpt, setFocusedOpt] = useState(null);
  const [qFocused, setQFocused] = useState(false);

  return (
    <Box style={[s.card, { backgroundColor: t.cardBackground, borderColor: t.placeholder }]}>
      <HStack style={[s.cardHeader, { backgroundColor: t.accent + '18', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 14 }]}>
        <HStack style={{ alignItems: 'center', gap: 8 }}>
          <Box style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{qIndex + 1}</Text>
          </Box>
          <Text style={{ color: t.accent, fontWeight: '700', fontSize: 15 }}>Question {qIndex + 1}</Text>
        </HStack>
        <HStack style={{ alignItems: 'center', gap: 12 }}>
          <HStack style={{ alignItems: 'center', gap: 6 }}>
            <Switch size="sm" value={q.allowMultiple} onToggle={() => onToggleMultiple(q.id)} trackColor={{ false: t.placeholder, true: t.accent }} />
            <Text style={{ color: t.secondaryText, fontSize: 12 }}>Multi-select</Text>
          </HStack>
          {onRemove && (
            <Pressable onPress={() => onRemove(q.id)} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={t.error || '#dc2626'} />
            </Pressable>
          )}
        </HStack>
      </HStack>

      <HStack style={{ gap: 10, marginBottom: 16, alignItems: 'stretch' }}>
        <Box style={{ width: 3, borderRadius: 4, backgroundColor: qFocused ? t.accent : t.placeholder }} />
        <VStack style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: t.secondaryText, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>Question text</Text>
          <TextInput
            style={[s.qInput, { backgroundColor: t.inputBackground, borderColor: qFocused ? t.accent : t.placeholder, color: t.text }]}
            placeholder="e.g. What do you think about…"
            placeholderTextColor={t.secondaryText}
            value={q.text}
            onChangeText={text => onUpdate(q.id, text)}
            onFocus={() => setQFocused(true)}
            onBlur={() => setQFocused(false)}
            selectionColor={t.accent}
          />
        </VStack>
      </HStack>

      <Box style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.placeholder, marginBottom: 14 }} />
      <Text style={{ color: t.secondaryText, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
        Answer Options
      </Text>

      {q.options.map((opt, oIdx) => (
        <HStack key={opt.id} style={{ alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Box style={[s.optBadge, { borderColor: focusedOpt === opt.id ? t.accent : t.placeholder, backgroundColor: t.inputBackground }]}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: focusedOpt === opt.id ? t.accent : t.secondaryText }}>
              {String.fromCharCode(65 + oIdx)}
            </Text>
          </Box>
          <TextInput
            style={[s.qInput, { flex: 1, backgroundColor: t.inputBackground, borderColor: focusedOpt === opt.id ? t.accent : t.placeholder, color: t.text }]}
            placeholder={`Option ${oIdx + 1}`}
            placeholderTextColor={t.secondaryText}
            value={opt.text}
            onChangeText={text => onUpdateOption(q.id, opt.id, text)}
            onFocus={() => setFocusedOpt(opt.id)}
            onBlur={() => setFocusedOpt(null)}
            selectionColor={t.accent}
          />
          {q.options.length > 2 && (
            <Pressable onPress={() => onRemoveOption(q.id, opt.id)} hitSlop={8}>
              <Ionicons name="close-circle-outline" size={20} color={t.error || '#dc2626'} />
            </Pressable>
          )}
        </HStack>
      ))}

      <Pressable style={[s.addOptBtn, { borderColor: t.accent + '55', backgroundColor: t.accent + '08' }]} onPress={() => onAddOption(q.id)}>
        <Ionicons name="add-circle" size={16} color={t.accent} />
        <Text style={{ color: t.accent, fontSize: 13, marginLeft: 6, fontWeight: '600' }}>Add Option</Text>
      </Pressable>
    </Box>
  );
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

const INITIAL_QUESTION = () => ({ id: Date.now(), text: '', allowMultiple: false, options: [{ id: 1, text: '' }, { id: 2, text: '' }] });

const uploadImage = async (imageUri) => {
  const filename = imageUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  const formData = new FormData();
  formData.append('file', { uri: imageUri, type, name: filename });
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/upload`, {
    method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return (await res.json()).url;
};

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function CreatePostScreen({ navigation, route }) {
  const [type, setType] = useState('discussion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [image, setImage] = useState('');
  const [endTime, setEndTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([INITIAL_QUESTION()]);

  const { user, loading: userLoading, getUserId } = useCurrentUser(route);
  const { theme } = useTheme();
  const t = getTheme(theme);
  const isPoll = type === 'poll';

  const handleTypeToggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setType(p => p === 'discussion' ? 'poll' : 'discussion');
  }, []);

  const pickImage = useCallback(async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert('Permission required', 'Please allow access to your media library.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.Images, allowsEditing: true, quality: 1 });
    if (!result.canceled) setImage(result.assets[0].uri);
  }, []);

  const addQuestion    = useCallback(() => setQuestions(p => [...p, INITIAL_QUESTION()]), []);
  const removeQuestion = useCallback((id) => setQuestions(p => p.filter(q => q.id !== id)), []);
  const updateQuestion = useCallback((id, text) => setQuestions(p => p.map(q => q.id === id ? { ...q, text } : q)), []);
  const toggleMultiple = useCallback((id) => setQuestions(p => p.map(q => q.id === id ? { ...q, allowMultiple: !q.allowMultiple } : q)), []);
  const addOption      = useCallback((qId) => setQuestions(p => p.map(q => q.id === qId ? { ...q, options: [...q.options, { id: Date.now(), text: '' }] } : q)), []);
  const removeOption   = useCallback((qId, oId) => setQuestions(p => p.map(q => q.id === qId ? { ...q, options: q.options.filter(o => o.id !== oId) } : q)), []);
  const updateOption   = useCallback((qId, oId, text) => setQuestions(p => p.map(q => q.id === qId ? { ...q, options: q.options.map(o => o.id === oId ? { ...o, text } : o) } : q)), []);

  const resetForm = () => { setTitle(''); setDescription(''); setTopic(''); setImage(''); setEndTime(null); setQuestions([INITIAL_QUESTION()]); };

  const handleSubmit = useCallback(async () => {
    const userId = user?.id || getUserId();
    if (!userId) return Alert.alert('Error', 'No logged-in user found!');
    if (!title.trim() || !description.trim() || !topic.trim()) return Alert.alert('Missing fields', 'Please fill in title, topic and description.');
    if (isPoll && questions.some(q => !q.text.trim() || q.options.some(o => !o.text.trim()))) return Alert.alert('Invalid poll', 'Fill in all questions and options.');
    try {
      setLoading(true);
      const imageUrl = image ? await uploadImage(image) : null;
      const data = { type, topic, title, description, image: imageUrl, end_time: isPoll && endTime ? endTime.toISOString() : null, author_id: userId,
        questions: isPoll ? questions.map(q => ({ text: q.text, allowMultiple: q.allowMultiple, options: q.options.map(o => ({ text: o.text })) })) : undefined };
      const { postId } = await createPost(data);
      let createdPost = null;
      try { createdPost = ((await getAllPosts()) || []).find(p => p.id === postId) || null; } catch {}
      Alert.alert('Success', 'Post created!', [{ text: 'View Post', onPress: () => {
        if (createdPost) navigation.navigate(createdPost.type === 'poll' ? 'Poll' : 'Discuss', { postData: createdPost });
        else navigation.navigate('Main');
      }}]);
      resetForm();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create post.');
    } finally { setLoading(false); }
  }, [user, getUserId, title, description, topic, isPoll, questions, image, endTime]);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[s.container, { backgroundColor: t.background, paddingTop: 16 }]}>
      <Text style={[s.header, { color: t.text }]}>Create a {isPoll ? 'Poll' : 'Discussion'}</Text>

      {/* Type Toggle */}
      <HStack style={[s.typeToggle, { backgroundColor: t.cardBackground, borderColor: t.placeholder }]}>
        {['discussion', 'poll'].map(opt => (
          <Pressable key={opt} onPress={() => { if (type !== opt) handleTypeToggle(); }}
            style={[s.typeOption, type === opt && { backgroundColor: t.accent, shadowColor: t.accent, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 }]}>
            <Ionicons name={opt === 'poll' ? 'stats-chart' : 'chatbox'} size={15} color={type === opt ? '#fff' : t.secondaryText} />
            <Text style={{ color: type === opt ? '#fff' : t.secondaryText, fontWeight: '600', fontSize: 13, textTransform: 'capitalize' }}>{opt}</Text>
          </Pressable>
        ))}
      </HStack>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          <VStack style={{ gap: 16 }}>

            {/* Title */}
            <FloatingInput t={t} label="Title" value={title} onChangeText={setTitle} maxLength={120} returnKeyType="next" />

            {/* Topic */}
            <VStack style={{ gap: 6 }}>
              <Text style={[s.sectionLabel, { color: t.secondaryText }]}>Topic</Text>
              <TopicPicker t={t} topic={topic} onSelect={setTopic} />
            </VStack>

            {/* Description */}
            <FloatingInput t={t} label="What's on your mind…" value={description} onChangeText={setDescription} multiline minHeight={140} maxLength={2000} />

            {/* Image */}
            <VStack style={{ gap: 6 }}>
              <Text style={[s.sectionLabel, { color: t.secondaryText }]}>Image (optional)</Text>
              <ImageZone t={t} image={image} onPick={pickImage} onRemove={() => setImage('')} />
            </VStack>

            {/* Poll extras */}
            {isPoll && (
              <VStack style={{ gap: 16 }}>
                <VStack style={{ gap: 6 }}>
                  <Text style={[s.sectionLabel, { color: t.secondaryText }]}>Poll End Date</Text>
                  <DateCard t={t} endTime={endTime} onPress={() => setShowDatePicker(true)} />
                  <DatePickerModal visible={showDatePicker} value={endTime} theme={theme} t={t} mode="date"
                    title="Select End Date" minimumDate={new Date()}
                    onConfirm={(date, { close }) => { setEndTime(date); if (close) setShowDatePicker(false); }}
                    onCancel={() => setShowDatePicker(false)} />
                </VStack>

                {questions.map((q, i) => (
                  <QuestionCard key={q.id} q={q} qIndex={i} t={t}
                    onUpdate={updateQuestion} onRemove={questions.length > 1 ? removeQuestion : null}
                    onToggleMultiple={toggleMultiple} onAddOption={addOption}
                    onRemoveOption={removeOption} onUpdateOption={updateOption} />
                ))}

                <Pressable style={[s.addQBtn, { borderColor: t.accent + '55', backgroundColor: t.accent + '08' }]} onPress={addQuestion}>
                  <Ionicons name="add-circle" size={20} color={t.accent} />
                  <Text style={{ color: t.accent, fontWeight: '600', marginLeft: 8 }}>Add Question</Text>
                </Pressable>
              </VStack>
            )}

            {/* Submit */}
            <Button onPress={handleSubmit} disabled={loading || userLoading}
              style={{
                backgroundColor: t.accent,
                borderRadius: 14,
                height: 52,
                marginTop: 4,
                opacity: loading || userLoading ? 0.6 : 1,
                ...(Platform.OS === 'ios'
                  ? { shadowColor: t.accent, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }
                  : { elevation: 4 }),
              }}>
              {loading || userLoading
                ? <ActivityIndicator color="#fff" />
                : <HStack style={{ alignItems: 'center', gap: 8 }}>
                    <Ionicons name="send" size={18} color="#fff" />
                    <ButtonText style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Publish {isPoll ? 'Poll' : 'Post'}</ButtonText>
                  </HStack>
              }
            </Button>

          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 16, letterSpacing: -0.3 },
  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginLeft: 2 },

  // Type toggle
  typeToggle: { flexDirection: 'row', alignSelf: 'center', borderRadius: 14, borderWidth: 1, padding: 4, gap: 4, marginBottom: 20 },
  typeOption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 18, borderRadius: 10 },

  // Floating label
  floatWrap: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingTop: 18, paddingBottom: 10, position: 'relative' },
  floatLabel: { position: 'absolute', left: 14, paddingHorizontal: 3, zIndex: 1 },
  floatInput: { fontSize: 15, paddingTop: 4 },
  charCount: { fontSize: 10, textAlign: 'right', marginTop: 4 },

  // Topic
  topicTrigger: { borderWidth: 1.5, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topicChevron: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  topicDot: { width: 10, height: 10, borderRadius: 5 },
  sheetOuter: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  topicSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1.5 },
  chipDot: { width: 8, height: 8, borderRadius: 4 },

  // Image
  uploadZone: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 16, paddingVertical: 32, alignItems: 'center', justifyContent: 'center' },
  uploadIconRing: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  imageCard: { borderRadius: 16, overflow: 'hidden', height: 200 },
  imagePreview: { width: '100%', height: '100%' },
  imageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', justifyContent: 'flex-end' },
  imageAction: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },

  // Date card
  dateCard: { borderWidth: 1.5, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateBadge: { width: 52, height: 60, borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: 4 },
  dateEdit: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  // Question card
  card: { borderWidth: 1, borderRadius: 14, padding: 14 },
  cardHeader: { justifyContent: 'space-between', alignItems: 'center' },
  qInput: { borderWidth: 1.5, borderRadius: 10, padding: 10, fontSize: 14 },
  optBadge: { width: 28, height: 28, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  addOptBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderRadius: 10, paddingVertical: 8, marginTop: 4 },

  // Add question
  addQBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 14, paddingVertical: 14 },
});