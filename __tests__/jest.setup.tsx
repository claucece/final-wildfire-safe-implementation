// Mock re-usable parts

// Mocking @expo/vector-icons
jest.mock("@expo/vector-icons/Feather", () => "FeatherIconMock");

// Mocking expo-font
jest.mock("expo-font", () => ({
  useFonts: () => [true], // Always return true: fonts are considered loaded
}));

// Mocking react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: "SafeAreaView",
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mocking expo-image
jest.mock("expo-image", () => ({
  Image: "Image",
}));

export const mockParams = { username: "testuser" };
// Mocking expo-router
jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(() => mockParams),
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock CustomGradient
jest.mock("@/components/CustomGradient", () => {
  return ({ children }: { children: React.ReactNode }) => <>{children}</>;
});

// Mocking services
jest.mock("@/app/auth/authService", () => ({
  loginUser: jest.fn().mockImplementation((email, password) => {
    return { success: true, username: "testuser" };
  }),
}));

// Mocking CustomAnimatedButton
jest.mock("@/components/CustomAnimatedButton", () => ({
  __esModule: true,
  default: ({ handleNavigation, title, accessibilityLabel }) => (
    <button
      onClick={() => handleNavigation(title)}
      aria-label={accessibilityLabel}
    >
      {title}
    </button>
  ),
}));

// Mocking hooks
jest.mock("@/hooks/useOrientation", () => ({
  useOrientation: jest.fn(),
}));

// Mocking brightness
jest.mock("expo-brightness", () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  getBrightnessAsync: jest.fn().mockResolvedValue(0.5), // Simulate a brightness value
  setBrightnessAsync: jest.fn().mockResolvedValue(undefined), // Mock setting brightness
}));

// The setup
describe("Jest Setup", () => {
  it("should run without errors", () => {
    expect(true).toBe(true); // Dummy test that always passes
  });
});
