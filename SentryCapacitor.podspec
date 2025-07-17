require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = 'SentryCapacitor'
  s.version = package['version']
  s.summary = package['description']
  s.license = package['license']
  s.homepage = package['repository']['url']
  s.author = package['author']
  s.source = { :git => package['repository']['url'], :tag => s.version.to_s }
  s.source_files = 'ios/Sources/**/*.{swift,h,m,c,cc,mm,cpp}'

  s.dependency 'Sentry/HybridSDK', '8.53.2'
  s.dependency 'Capacitor'

  if File.exist?('../../@capacitor/core/package.json') == false
    # If Capacitor was not found (could happen when using Yarn PNP), fallback to the
    # required minimum version of Capacitor 7.
    miniOSVersion = '14.0'
  else
    capacitorPackage =  JSON.parse(File.read(File.join(__dir__, '../../@capacitor/core/package.json')))
    capacitorVersion = capacitorPackage['version']
    majorVersion = capacitorVersion.split('.').first.to_i

    if majorVersion <= 3
      miniOSVersion = '12.0' # Capacitor 3, 2.
    elsif majorVersion < 7
      miniOSVersion = '13.0' # Capacitor 6 or older.
    else
      miniOSVersion = '14.0' # Capacitor 7 or higher.
    end
  end
  s.ios.deployment_target  = miniOSVersion
  s.swift_version = '5.1'
end
