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

  if File.exist?('../../@capacitor/core/package.json') == false
    # If Capacitor was not found (could happen when using Yarn PNP), fallback to the
    # required minimum version of Capacitor 4.
    miniOSVersion = '13.0'
  else
    capacitorPackage =  JSON.parse(File.read(File.join(__dir__, '../../@capacitor/core/package.json')))
    capacitorVersion = capacitorPackage['version']
    if capacitorVersion.start_with?("2.") or capacitorVersion.start_with?("3.")
      miniOSVersion = '12.0'
    else
      miniOSVersion = '13.0' # Required for Capacitor 4 and newer.
    end
  end
  s.ios.deployment_target  = miniOSVersion
  s.dependency 'Sentry', '~> 7.27.1'
  s.dependency 'Capacitor'
  s.swift_version = '5.1'
end
