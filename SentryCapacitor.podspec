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
  s.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'
  capacitorPackage =  JSON.parse(File.read(File.join(__dir__, '../../@capacitor/core/package.json')))
  capacitorVersion = capacitorPackage['version']
  if capacitorVersion.start_with?("2.") or capacitorVersion.start_with?("3.")
    miniOSVersion = '12.0'
  else
    miniOSVersion = '13.0' # Required for Capacitor 4 and newer.
  end
  s.ios.deployment_target  = miniOSVersion
  s.dependency 'Sentry', '~> 7.23.0'
  s.dependency 'Capacitor'
  s.swift_version = '5.1'
end
